import { describe, it, expect } from 'vitest'
import type { TreeItem, TreeItemId } from '@shared/model'
import { TreeStore } from './TreeStore'

interface BenchmarkSample {
  name: string
  iterations: number
  avgMs: number
  minMs: number
  maxMs: number
  resultSize?: number
}

interface HeavyTreeBuildResult {
  items: TreeItem[]
  totalNodes: number
  rootId: TreeItemId
  deepLeafId: TreeItemId
  wideNodeId: TreeItemId
  plainLeafId: TreeItemId
}

const LABEL_PADDING = 'Айтем '.repeat(40)

function createHeavyPayload(index: number): Record<string, unknown> {
  return {
    index,
    createdAt: '2024-01-01T00:00:00.000Z',
    tags: Array.from({ length: 24 }, (_, tagIndex) => `tag-${index}-${tagIndex}`),
    metrics: {
      weight: index * 1.37,
      volume: index * 2.11,
      flags: Array.from({ length: 16 }, (_, flagIndex) => flagIndex % 2 === 0),
    },
    notes: Array.from({ length: 8 }, (_, noteIndex) => ({
      id: `note-${index}-${noteIndex}`,
      text: `Примечание ${noteIndex} для узла ${index}`.repeat(3),
    })),
  }
}

/** ~100k узлов: широкое дерево + тяжёлые объекты */
function buildHeavyTree(
  branchCount = 50,
  childrenPerBranch = 200,
  leavesPerChild = 10,
): HeavyTreeBuildResult {
  const items: TreeItem[] = []
  const rootId: TreeItemId = 'root'

  items.push({
    id: rootId,
    parent: null,
    label: `${LABEL_PADDING}Корень`,
    ...createHeavyPayload(0),
  })

  let nodeIndex = 1
  let deepLeafId: TreeItemId = rootId
  let plainLeafId: TreeItemId = rootId

  for (let branch = 0; branch < branchCount; branch++) {
    const branchId: TreeItemId = `branch-${branch}`
    items.push({
      id: branchId,
      parent: rootId,
      label: `${LABEL_PADDING}Ветка ${branch}`,
      ...createHeavyPayload(nodeIndex++),
    })

    for (let child = 0; child < childrenPerBranch; child++) {
      const childId: TreeItemId = `branch-${branch}-child-${child}`
      items.push({
        id: childId,
        parent: branchId,
        label: `${LABEL_PADDING}Узел ${branch}-${child}`,
        ...createHeavyPayload(nodeIndex++),
      })

      for (let leaf = 0; leaf < leavesPerChild; leaf++) {
        const leafId: TreeItemId = `branch-${branch}-child-${child}-leaf-${leaf}`
        items.push({
          id: leafId,
          parent: childId,
          label: `${LABEL_PADDING}Лист ${branch}-${child}-${leaf}`,
          ...createHeavyPayload(nodeIndex++),
        })
        deepLeafId = leafId
        plainLeafId = leafId
      }
    }
  }

  return {
    items,
    totalNodes: items.length,
    rootId,
    deepLeafId,
    wideNodeId: rootId,
    plainLeafId,
  }
}

function measureSync(
  name: string,
  fn: () => unknown,
  iterations = 50,
): BenchmarkSample {
  let minMs = Number.POSITIVE_INFINITY
  let maxMs = 0
  let totalMs = 0
  let resultSize: number | undefined

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    const result = fn()
    const elapsed = performance.now() - start
    totalMs += elapsed
    minMs = Math.min(minMs, elapsed)
    maxMs = Math.max(maxMs, elapsed)
    if (Array.isArray(result)) {
      resultSize = result.length
    }
  }

  return {
    name,
    iterations,
    avgMs: totalMs / iterations,
    minMs,
    maxMs,
    resultSize,
  }
}

function formatBenchmarkTable(samples: BenchmarkSample[]): string {
  const header = ['Метод', 'Итераций', 'avg (ms)', 'min (ms)', 'max (ms)', 'Размер']
  const rows = samples.map((s) => [
    s.name,
    String(s.iterations),
    s.avgMs.toFixed(4),
    s.minMs.toFixed(4),
    s.maxMs.toFixed(4),
    s.resultSize != null ? String(s.resultSize) : '—',
  ])
  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => r[i]!.length)),
  )
  const line = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i]!)).join(' | ')
  return [line(header), line(widths.map((w) => '-'.repeat(w))), ...rows.map(line)].join('\n')
}

describe('TreeStore — бенчмарк на максимальном дереве', () => {
  it(
    'замеряет время всех методов на тяжёлом дереве ~100k узлов',
    () => {
    const heavyTree = buildHeavyTree()
    const { rootId, wideNodeId, deepLeafId, plainLeafId, totalNodes } = heavyTree

    const constructSample = measureSync(
      'constructor',
      () => new TreeStore(heavyTree.items),
      3,
    )

    const store = new TreeStore(heavyTree.items)
    const samples: BenchmarkSample[] = [
      constructSample,
      measureSync('getAll', () => store.getAll(), 50),
      measureSync('getItem (лист)', () => store.getItem(plainLeafId), 100),
      measureSync('getItem (корень)', () => store.getItem(rootId), 100),
      measureSync('getChildren (корень)', () => store.getChildren(rootId), 100),
      measureSync(
        'getChildren (средний)',
        () => store.getChildren('branch-25-child-100'),
        100,
      ),
      // O(размер поддерева): ~110k узлов — одна итерация достаточна для замера
      measureSync('getAllChildren (корень)', () => store.getAllChildren(wideNodeId), 1),
      measureSync('getAllChildren (ветка)', () => store.getAllChildren('branch-10'), 50),
      measureSync('getAllParents (глубокий лист)', () => store.getAllParents(deepLeafId), 100),
    ]

    let addCounter = 0
    const addStore = new TreeStore(heavyTree.items)
    samples.push(
      measureSync(
        'addItem',
        () =>
          addStore.addItem({
            id: `bench-add-${addCounter++}`,
            parent: plainLeafId,
            label: 'Benchmark',
            ...createHeavyPayload(999_999),
          }),
        10,
      ),
    )

    const updateStore = new TreeStore(heavyTree.items)
    samples.push(
      measureSync(
        'updateItem',
        () =>
          updateStore.updateItem({
            ...updateStore.getItem('branch-1-child-1'),
            label: 'updated',
          }),
        50,
      ),
    )

    const removeTarget = 'branch-0-child-0-leaf-0'
    const removeStore = new TreeStore(heavyTree.items)
    samples.push(
      measureSync('removeItem (лист)', () => removeStore.removeItem(removeTarget), 1),
    )

    console.info('\n=== TreeStore benchmark (heavy tree) ===')
    console.info(`Узлов: ${totalNodes.toLocaleString('ru-RU')}`)
    console.info('\n' + formatBenchmarkTable(samples) + '\n')

    expect(totalNodes).toBe(110_051)
    expect(samples.find((s) => s.name === 'getItem (лист)')!.avgMs).toBeLessThan(1)
    },
    120_000,
  )
})
