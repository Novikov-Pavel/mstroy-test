import { describe, expect, it } from 'vitest'
import {
  TreeItemCircularReferenceError,
  TreeItemDuplicateError,
  TreeItemInvalidParentError,
  TreeItemNotFoundError,
  TreeStoreError,
  isTreeStoreError,
} from './TreeStoreError'
import { AppError } from '@shared/lib/errors'

describe('TreeStoreError', () => {
  it('наследует AppError', () => {
    const error = new TreeStoreError('tree failed')

    expect(error).toBeInstanceOf(AppError)
    expect(error).toBeInstanceOf(TreeStoreError)
    expect(error.code).toBe('TREE_STORE_ERROR')
  })

  it('TreeItemNotFoundError содержит itemId в context', () => {
    const error = new TreeItemNotFoundError('missing')

    expect(error.itemId).toBe('missing')
    expect(error.code).toBe('TREE_ITEM_NOT_FOUND')
    expect(error.message).toContain('missing')
  })

  it('TreeItemDuplicateError содержит itemId', () => {
    const error = new TreeItemDuplicateError(42)

    expect(error.itemId).toBe(42)
    expect(error.code).toBe('TREE_ITEM_DUPLICATE')
  })

  it('TreeItemInvalidParentError содержит оба идентификатора', () => {
    const error = new TreeItemInvalidParentError(3, 99)

    expect(error.itemId).toBe(3)
    expect(error.parentId).toBe(99)
    expect(error.code).toBe('TREE_ITEM_INVALID_PARENT')
  })

  it('TreeItemCircularReferenceError описывает цикл', () => {
    const error = new TreeItemCircularReferenceError(7)

    expect(error.itemId).toBe(7)
    expect(error.code).toBe('TREE_ITEM_CIRCULAR_REFERENCE')
  })

  it('isTreeStoreError распознаёт иерархию', () => {
    expect(isTreeStoreError(new TreeItemNotFoundError(1))).toBe(true)
    expect(isTreeStoreError(new AppError('x'))).toBe(false)
  })
})
