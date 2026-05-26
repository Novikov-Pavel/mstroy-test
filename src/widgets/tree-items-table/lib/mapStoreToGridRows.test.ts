import { describe, expect, it } from 'vitest'
import { TreeStore, INITIAL_TREE_ITEMS } from '@entities/tree-item'
import { mapStoreToGridRows, resolveRowCategory } from './mapStoreToGridRows'

describe('mapStoreToGridRows', () => {
  const store = new TreeStore(INITIAL_TREE_ITEMS.map((item) => ({ ...item })))

  it('resolveRowCategory возвращает Группа/Элемент', () => {
    expect(resolveRowCategory(true)).toBe('Группа')
    expect(resolveRowCategory(false)).toBe('Элемент')
  })

  it('mapStoreToGridRows добавляет category для каждой строки', () => {
    const rows = mapStoreToGridRows(store)
    const row7 = rows.find((row) => row.id === 7)

    expect(rows).toHaveLength(INITIAL_TREE_ITEMS.length)
    expect(row7?.category).toBe('Элемент')
    expect(rows.find((row) => row.id === 1)?.category).toBe('Группа')
  })

  it('обновляет category после добавления потомка', () => {
    const mutableStore = new TreeStore([
      { id: 1, parent: null, label: 'Root' },
      { id: 2, parent: 1, label: 'Leaf' },
    ])

    let rows = mapStoreToGridRows(mutableStore)
    expect(rows.find((row) => row.id === 2)?.category).toBe('Элемент')

    mutableStore.addItem({ id: 3, parent: 2, label: 'Child' })
    rows = mapStoreToGridRows(mutableStore)

    expect(rows.find((row) => row.id === 2)?.category).toBe('Группа')
  })
})
