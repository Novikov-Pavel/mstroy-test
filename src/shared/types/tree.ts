export type TreeItemId = string | number

export interface TreeItem {
  id: TreeItemId
  parent: TreeItemId | null
  label: string
  [key: string]: unknown
}
