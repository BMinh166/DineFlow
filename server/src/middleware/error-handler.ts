import type { ErrorRequestHandler } from 'express'
import { AppError } from '../utils/app-error.js'
import { errorResponse } from '../utils/api-response.js'

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.status).json(errorResponse(error.message, error.code))
    return
  }

  console.error(error)
  response.status(500).json(errorResponse('Internal server error.'))
}
