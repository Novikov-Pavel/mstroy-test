import { AppError, type AppErrorOptions } from '@shared/lib/errors'
import type { TreeItemId } from '@shared/model'

export class TreeStoreError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { code: options.code ?? 'TREE_STORE_ERROR', ...options })
  }
}

export class TreeItemNotFoundError extends TreeStoreError {
  readonly itemId: TreeItemId

  constructor(itemId: TreeItemId) {
    super(`Элемент с id "${String(itemId)}" не найден`, {
      code: 'TREE_ITEM_NOT_FOUND',
      context: { itemId },
    })
    this.itemId = itemId
  }
}

export class TreeItemDuplicateError extends TreeStoreError {
  readonly itemId: TreeItemId

  constructor(itemId: TreeItemId) {
    super(`Элемент с id "${String(itemId)}" уже существует`, {
      code: 'TREE_ITEM_DUPLICATE',
      context: { itemId },
    })
    this.itemId = itemId
  }
}

export class TreeItemInvalidParentError extends TreeStoreError {
  readonly itemId: TreeItemId
  readonly parentId: TreeItemId

  constructor(itemId: TreeItemId, parentId: TreeItemId) {
    super(
      `Родитель с id "${String(parentId)}" не найден для элемента "${String(itemId)}"`,
      {
        code: 'TREE_ITEM_INVALID_PARENT',
        context: { itemId, parentId },
      },
    )
    this.itemId = itemId
    this.parentId = parentId
  }
}

export class TreeItemCircularReferenceError extends TreeStoreError {
  readonly itemId: TreeItemId

  constructor(itemId: TreeItemId) {
    super(
      `Невозможно установить родителя: элемент "${String(itemId)}" входит в свою цепочку предков`,
      {
        code: 'TREE_ITEM_CIRCULAR_REFERENCE',
        context: { itemId },
      },
    )
    this.itemId = itemId
  }
}

export function isTreeStoreError(error: unknown): error is TreeStoreError {
  return error instanceof TreeStoreError
}
