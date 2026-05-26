import { describe, expect, it, beforeEach } from 'vitest'
import {
  TreeItemCircularReferenceError,
  TreeItemDuplicateError,
  TreeItemInvalidParentError,
  TreeItemNotFoundError,
} from '@shared/lib/errors'
import type { TreeItem } from '@shared/types'
import { INITIAL_TREE_ITEMS } from '../config/initialItems'
import { TreeStore } from './TreeStore'

function cloneItems(): TreeItem[] {
  return INITIAL_TREE_ITEMS.map((item) => ({ ...item }))
}

describe('TreeStore', () => {
  let store: TreeStore

  beforeEach(() => {
    store = new TreeStore(cloneItems())
  })

  describe('getAll / getItem', () => {
    it('getAll возвращает исходный массив хранилища', () => {
      const all = store.getAll()

      expect(all).toHaveLength(INITIAL_TREE_ITEMS.length)
      expect(all).toBe(store.getAll())
    })

    it('getItem возвращает элемент по числовому и строковому id', () => {
      expect(store.getItem(1).label).toBe('Айтем 1')
      expect(store.getItem('91064cee').label).toBe('Айтем 2')
    })

    it('getItem бросает TreeItemNotFoundError для отсутствующего id', () => {
      expect(() => store.getItem('unknown')).toThrow(TreeItemNotFoundError)
    })
  })

  describe('getChildren', () => {
    it('возвращает прямых потомков', () => {
      const children = store.getChildren(1)

      expect(children.map((item) => item.id)).toEqual(['91064cee', 3])
    })

    it('возвращает пустой массив для листа', () => {
      expect(store.getChildren(8)).toEqual([])
    })

    it('возвращает потомков узла со строковым id', () => {
      expect(store.getChildren('91064cee').map((item) => item.id)).toEqual([
        4, 5, 6,
      ])
    })
  })

  describe('getAllChildren', () => {
    it('возвращает всех потомков на любой глубине', () => {
      const descendants = store.getAllChildren(1)
      const ids = descendants.map((item) => item.id)

      expect(ids).toEqual(['91064cee', 3, 4, 5, 6, 7, 8])
    })

    it('возвращает поддерево промежуточного узла', () => {
      const descendants = store.getAllChildren('91064cee')
      const ids = descendants.map((item) => item.id)

      expect(ids).toEqual([4, 5, 6, 7, 8])
    })

    it('возвращает пустой массив для листа', () => {
      expect(store.getAllChildren(7)).toEqual([])
    })
  })

  describe('getAllParents', () => {
    it('возвращает цепочку от элемента к корню с важным порядком', () => {
      const chain = store.getAllParents(7)

      expect(chain.map((item) => item.id)).toEqual([7, 4, '91064cee', 1])
    })

    it('для корня возвращает только сам элемент', () => {
      expect(store.getAllParents(1).map((item) => item.id)).toEqual([1])
    })

    it('для прямого потомка корня возвращает два уровня', () => {
      expect(store.getAllParents(3).map((item) => item.id)).toEqual([3, 1])
    })
  })

  describe('addItem', () => {
    it('добавляет элемент и делает его доступным через getItem', () => {
      store.addItem({ id: 99, parent: 8, label: 'Новый лист' })

      expect(store.getItem(99).label).toBe('Новый лист')
      expect(store.getChildren(8).map((item) => item.id)).toContain(99)
      expect(store.getAll()).toHaveLength(INITIAL_TREE_ITEMS.length + 1)
    })

    it('бросает TreeItemDuplicateError при повторном id', () => {
      expect(() =>
        store.addItem({ id: 1, parent: null, label: 'Дубликат' }),
      ).toThrow(TreeItemDuplicateError)
    })

    it('бросает TreeItemInvalidParentError если родитель не существует', () => {
      expect(() =>
        store.addItem({ id: 50, parent: 404, label: 'Сирота' }),
      ).toThrow(TreeItemInvalidParentError)
    })

    it('бросает TreeItemCircularReferenceError при parent === id', () => {
      expect(() =>
        store.addItem({ id: 60, parent: 60, label: 'Цикл' }),
      ).toThrow(TreeItemCircularReferenceError)
    })
  })

  describe('updateItem', () => {
    it('обновляет поля существующего элемента', () => {
      store.updateItem({ id: 5, parent: '91064cee', label: 'Обновлённый 5' })

      expect(store.getItem(5).label).toBe('Обновлённый 5')
    })

    it('перемещает элемент при смене parent', () => {
      store.updateItem({ id: 5, parent: 4, label: 'Айтем 5' })

      expect(store.getChildren('91064cee').map((item) => item.id)).not.toContain(5)
      expect(store.getChildren(4).map((item) => item.id)).toContain(5)
    })

    it('бросает TreeItemCircularReferenceError при перемещении к потомку', () => {
      expect(() =>
        store.updateItem({ id: 1, parent: 7, label: 'Айтем 1' }),
      ).toThrow(TreeItemCircularReferenceError)
    })
  })

  describe('removeItem', () => {
    it('удаляет элемент и всех потомков', () => {
      store.removeItem('91064cee')

      expect(() => store.getItem('91064cee')).toThrow(TreeItemNotFoundError)
      expect(() => store.getItem(4)).toThrow(TreeItemNotFoundError)
      expect(() => store.getItem(7)).toThrow(TreeItemNotFoundError)
      expect(store.getItem(3).id).toBe(3)
      expect(store.getAll()).toHaveLength(2)
    })

    it('удаляет лист без затрагивания соседей', () => {
      store.removeItem(8)

      expect(store.getChildren(4).map((item) => item.id)).toEqual([7])
    })
  })

  describe('конструктор', () => {
    it('бросает TreeItemDuplicateError при дублирующихся id во входных данных', () => {
      expect(
        () =>
          new TreeStore([
            { id: 1, parent: null, label: 'A' },
            { id: 1, parent: null, label: 'B' },
          ]),
      ).toThrow(TreeItemDuplicateError)
    })
  })

  describe('производительность', () => {
    function buildBalancedTree(leafCount: number): TreeItem[] {
      const items: TreeItem[] = [{ id: 'root', parent: null, label: 'root' }]

      for (let index = 1; index <= leafCount; index++) {
        items.push({
          id: index,
          parent: index === 1 ? 'root' : Math.ceil(index / 2),
          label: `node-${index}`,
        })
      }

      return items
    }

    it('выполняет основные операции на большом дереве за приемлемое время', () => {
      const treeSize = 20_000
      const largeStore = new TreeStore(buildBalancedTree(treeSize))
      const sampleId = 10_000

      const measure = (fn: () => void): number => {
        const start = performance.now()
        fn()
        return performance.now() - start
      }

      expect(measure(() => largeStore.getItem(sampleId))).toBeLessThan(5)
      expect(measure(() => largeStore.getChildren('root'))).toBeLessThan(10)
      expect(measure(() => largeStore.getAllChildren('root'))).toBeLessThan(50)
      expect(measure(() => largeStore.getAllParents(sampleId))).toBeLessThan(5)

      const removeStart = performance.now()
      largeStore.removeItem(treeSize)
      expect(performance.now() - removeStart).toBeLessThan(50)
    })
  })
})
