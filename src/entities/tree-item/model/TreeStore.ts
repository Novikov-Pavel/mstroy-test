import {
  TreeItemCircularReferenceError,
  TreeItemDuplicateError,
  TreeItemInvalidParentError,
  TreeItemNotFoundError,
} from '@shared/lib/errors'
import type { TreeItem, TreeItemId } from '@shared/types'

const ROOT_KEY = Symbol('tree-root')

type ParentKey = TreeItemId | typeof ROOT_KEY

export class TreeStore {
  private readonly items: TreeItem[]
  private readonly itemsById = new Map<TreeItemId, TreeItem>()
  private readonly childrenByParentId = new Map<ParentKey, TreeItemId[]>()

  constructor(items: TreeItem[]) {
    this.items = items

    for (const item of items) {
      if (this.itemsById.has(item.id)) {
        throw new TreeItemDuplicateError(item.id)
      }
      this.registerItem(item)
    }
  }

  getAll(): TreeItem[] {
    return this.items
  }

  getItem(id: TreeItemId): TreeItem {
    const item = this.itemsById.get(id)
    if (!item) {
      throw new TreeItemNotFoundError(id)
    }
    return item
  }

  getChildren(id: TreeItemId): TreeItem[] {
    this.getItem(id)
    const childIds = this.childrenByParentId.get(id) ?? []
    return childIds.map((childId) => this.getItem(childId))
  }

  getAllChildren(id: TreeItemId): TreeItem[] {
    this.getItem(id)
    const result: TreeItem[] = []
    const queue = [...(this.childrenByParentId.get(id) ?? [])]

    while (queue.length > 0) {
      const childId = queue.shift()!
      const child = this.getItem(childId)
      result.push(child)
      const nested = this.childrenByParentId.get(childId)
      if (nested?.length) {
        queue.push(...nested)
      }
    }

    return result
  }

  getAllParents(id: TreeItemId): TreeItem[] {
    const chain: TreeItem[] = []
    let current: TreeItem | undefined = this.getItem(id)

    while (current) {
      chain.push(current)
      if (current.parent === null) {
        break
      }
      current = this.itemsById.get(current.parent)
      if (!current) {
        throw new TreeItemNotFoundError(id)
      }
    }

    return chain
  }

  addItem(item: TreeItem): void {
    if (this.itemsById.has(item.id)) {
      throw new TreeItemDuplicateError(item.id)
    }

    if (item.parent === item.id) {
      throw new TreeItemCircularReferenceError(item.id)
    }

    if (item.parent !== null) {
      this.assertParentExists(item.id, item.parent)
    }

    this.items.push(item)
    this.registerItem(item)
  }

  removeItem(id: TreeItemId): void {
    this.getItem(id)

    const idsToRemove: TreeItemId[] = []
    const stack: TreeItemId[] = [id]

    while (stack.length > 0) {
      const currentId = stack.pop()!
      idsToRemove.push(currentId)

      const childIds = this.childrenByParentId.get(currentId)
      if (childIds?.length) {
        stack.push(...childIds)
      }
    }

    for (const removeId of idsToRemove) {
      const item = this.itemsById.get(removeId)
      if (!item) {
        continue
      }

      this.unlinkFromParent(item)
      this.itemsById.delete(removeId)
      this.childrenByParentId.delete(removeId)

      const index = this.items.indexOf(item)
      if (index !== -1) {
        this.items.splice(index, 1)
      }
    }
  }

  updateItem(updated: TreeItem): void {
    const existing = this.getItem(updated.id)

    if (updated.parent === updated.id) {
      throw new TreeItemCircularReferenceError(updated.id)
    }

    if (updated.parent !== null) {
      this.assertParentExists(updated.id, updated.parent)
      this.assertNoCircularReference(updated.id, updated.parent)
    }

    const parentChanged = existing.parent !== updated.parent

    if (parentChanged) {
      this.unlinkFromParent(existing)
    }

    Object.assign(existing, updated)

    if (parentChanged) {
      this.linkToParent(existing)
    }
  }

  private registerItem(item: TreeItem): void {
    this.itemsById.set(item.id, item)
    this.linkToParent(item)
  }

  private parentKey(parent: TreeItemId | null): ParentKey {
    return parent === null ? ROOT_KEY : parent
  }

  private linkToParent(item: TreeItem): void {
    const key = this.parentKey(item.parent)
    let siblings = this.childrenByParentId.get(key)

    if (!siblings) {
      siblings = []
      this.childrenByParentId.set(key, siblings)
    }

    if (!siblings.includes(item.id)) {
      siblings.push(item.id)
    }
  }

  private unlinkFromParent(item: TreeItem): void {
    const key = this.parentKey(item.parent)
    const siblings = this.childrenByParentId.get(key)

    if (!siblings) {
      return
    }

    const index = siblings.indexOf(item.id)
    if (index !== -1) {
      siblings.splice(index, 1)
    }
  }

  private assertParentExists(itemId: TreeItemId, parentId: TreeItemId): void {
    if (!this.itemsById.has(parentId)) {
      throw new TreeItemInvalidParentError(itemId, parentId)
    }
  }

  private assertNoCircularReference(
    itemId: TreeItemId,
    parentId: TreeItemId,
  ): void {
    let currentId: TreeItemId | null = parentId

    while (currentId !== null) {
      if (currentId === itemId) {
        throw new TreeItemCircularReferenceError(itemId)
      }
      const parent = this.itemsById.get(currentId)
      currentId = parent?.parent ?? null
    }
  }
}
