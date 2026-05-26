import type { TreeItem } from '@shared/types'

export type TreeRowCategory = 'Группа' | 'Элемент'

export interface TreeGridRow extends TreeItem {
  category: TreeRowCategory
}
