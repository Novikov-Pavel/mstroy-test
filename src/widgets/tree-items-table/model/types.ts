import type { TreeItem } from '@shared/model'

export type TreeRowCategory = 'Группа' | 'Элемент'

export interface TreeGridRow extends TreeItem {
  category: TreeRowCategory
}
