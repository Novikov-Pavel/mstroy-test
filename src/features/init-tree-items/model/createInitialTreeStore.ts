import { TreeStore } from '@entities/tree-item'
import { MOCK_TREE_ITEMS } from '@shared/config'
import type { TreeItem } from '@shared/model'

function cloneMockTreeItems(items: TreeItem[]): TreeItem[] {
  return items.map((item) => ({ ...item }))
}

export function createInitialTreeStore(): TreeStore {
  return new TreeStore(cloneMockTreeItems(MOCK_TREE_ITEMS))
}
