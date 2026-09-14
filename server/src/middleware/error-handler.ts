import type { ErrorRequestHandler } from 'express'

type ErrorWithStatus = Error & { status?: unknown }

export const errorHandler: ErrorRequestHandler = (
  error: ErrorWithStatus,
  _request,
  response,
  _next,
) => {
  const status =
    typeof error.status === 'number' && error.status >= 400 && error.status < 600
      ? error.status
      : 500

  if (status >= 500) {
    console.error(error)
  }

  response.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error.' : 'Request failed.',
  })
}
