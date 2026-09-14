import type { RequestHandler } from 'express'
import { ZodError, type ZodType } from 'zod'
import { BadRequest } from '../utils/app-error.js'

const validationErrorCode = 'VALIDATION_ERROR'

export interface RequestValidationSchemas {
  body?: ZodType
  params?: ZodType
  query?: ZodType
}

interface ValidatedRequestData {
  body?: unknown
  params?: unknown
  query?: unknown
}

export function validateRequest(schemas: RequestValidationSchemas): RequestHandler {
  return (request, response, next) => {
    try {
      const validated: ValidatedRequestData = {}

      if (schemas.body) {
        validated.body = schemas.body.parse(request.body)
      }

      if (schemas.params) {
        validated.params = schemas.params.parse(request.params)
      }

      if (schemas.query) {
        validated.query = schemas.query.parse(request.query)
      }

      if (schemas.body) {
        request.body = validated.body
      }

      if (schemas.params) {
        request.params = validated.params as typeof request.params
      }

      response.locals.validated = validated
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        next(new BadRequest('Invalid request.', validationErrorCode))
        return
      }

      next(error)
    }
  }
}
