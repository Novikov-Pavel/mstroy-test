import type { TreeStore } from '@entities/tree-item'
import type { TreeGridRow, TreeRowCategory } from '../model/types'

export function resolveRowCategory(hasChildren: boolean): TreeRowCategory {
  return hasChildren ? 'Группа' : 'Элемент'
}

export function mapStoreToGridRows(store: TreeStore): TreeGridRow[] {
  return store.getAll().map((item) => ({
    ...item,
    // Ag Grid сопоставляет parent с getRowId — приводим к строке
    parent: item.parent === null ? null : String(item.parent),
    category: resolveRowCategory(store.getChildren(item.id).length > 0),
  }))
}
