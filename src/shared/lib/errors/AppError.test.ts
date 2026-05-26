import { describe, expect, it } from 'vitest'
import { AppError, isAppError } from './AppError'

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, { code: 'VALIDATION_ERROR' })
  }
}

describe('AppError', () => {
  it('наследует Error и сохраняет цепочку прототипов', () => {
    const error = new AppError('test message')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error.name).toBe('AppError')
    expect(error.message).toBe('test message')
    expect(error.code).toBe('APP_ERROR')
  })

  it('поддерживает cause и context', () => {
    const cause = new Error('root')
    const error = new AppError('wrapped', {
      code: 'WRAPPED',
      cause,
      context: { field: 'id' },
    })

    expect(error.code).toBe('WRAPPED')
    expect(error.cause).toBe(cause)
    expect(error.context).toEqual({ field: 'id' })
  })

  it('позволяет расширять через наследование', () => {
    const error = new ValidationError('invalid')

    expect(error).toBeInstanceOf(AppError)
    expect(error).toBeInstanceOf(ValidationError)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.name).toBe('ValidationError')
  })

  it('сериализуется в JSON с основными полями', () => {
    const json = new AppError('boom', { context: { a: 1 } }).toJSON()

    expect(json).toMatchObject({
      name: 'AppError',
      message: 'boom',
      code: 'APP_ERROR',
      context: { a: 1 },
    })
    expect(json.stack).toBeTypeOf('string')
  })

  it('isAppError определяет экземпляры и наследников', () => {
    expect(isAppError(new AppError('x'))).toBe(true)
    expect(isAppError(new ValidationError('x'))).toBe(true)
    expect(isAppError(new Error('x'))).toBe(false)
    expect(isAppError(null)).toBe(false)
  })
})
