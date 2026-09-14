import type { RequestHandler } from 'express'
import { errorResponse } from '../utils/api-response.js'

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json(errorResponse('Route not found.'))
}
