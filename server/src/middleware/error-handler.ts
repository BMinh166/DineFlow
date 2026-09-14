import type { ErrorRequestHandler } from 'express'
import { AppError } from '../utils/app-error.js'
import { errorResponse } from '../utils/api-response.js'

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (isMalformedJsonError(error)) {
    response
      .status(400)
      .json(errorResponse('Invalid JSON body.', 'INVALID_JSON'))
    return
  }

  if (isPayloadTooLargeError(error)) {
    response
      .status(413)
      .json(errorResponse('Request body too large.', 'PAYLOAD_TOO_LARGE'))
    return
  }

  if (error instanceof AppError) {
    response.status(error.status).json(errorResponse(error.message, error.code))
    return
  }

  console.error(error)
  response.status(500).json(errorResponse('Internal server error.'))
}

function isMalformedJsonError(error: unknown): boolean {
  if (!(error instanceof SyntaxError) || typeof error !== 'object' || error === null) {
    return false
  }

  const parserError = error as { status?: unknown; type?: unknown }

  return parserError.status === 400 && parserError.type === 'entity.parse.failed'
}

function isPayloadTooLargeError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const parserError = error as { status?: unknown; type?: unknown }

  return parserError.status === 413 && parserError.type === 'entity.too.large'
}
