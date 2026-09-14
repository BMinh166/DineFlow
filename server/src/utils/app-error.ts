export class AppError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = new.target.name
    this.status = status
    this.code = code
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class BadRequest extends AppError {
  constructor(message = 'Bad request.', code?: string) {
    super(message, 400, code)
  }
}

export class Unauthorized extends AppError {
  constructor(message = 'Unauthorized.', code?: string) {
    super(message, 401, code)
  }
}

export class Forbidden extends AppError {
  constructor(message = 'Forbidden.', code?: string) {
    super(message, 403, code)
  }
}

export class NotFound extends AppError {
  constructor(message = 'Not found.', code?: string) {
    super(message, 404, code)
  }
}

export class Conflict extends AppError {
  constructor(message = 'Conflict.', code?: string) {
    super(message, 409, code)
  }
}
