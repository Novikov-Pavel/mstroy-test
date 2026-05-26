export interface AppErrorOptions {
  code?: string
  cause?: unknown
  context?: Record<string, unknown>
}

/**
 * Базовая ошибка приложения. Наследники могут добавлять доменную семантику.
 */
export class AppError extends Error {
  readonly code: string
  readonly context?: Record<string, unknown>

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = new.target.name
    this.code = options.code ?? 'APP_ERROR'
    this.context = options.context

    if (options.cause !== undefined) {
      this.cause = options.cause
    }

    Object.setPrototypeOf(this, new.target.prototype)
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack,
    }
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
