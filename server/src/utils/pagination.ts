import { BadRequest } from './app-error.js'

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

const invalidPaginationCode = 'INVALID_PAGINATION'

export interface Pagination {
  page: number
  limit: number
  skip: number
}

export function parsePagination(pageValue: unknown, limitValue: unknown): Pagination {
  const page = parsePositiveInteger(pageValue, DEFAULT_PAGE)
  const limit = parsePositiveInteger(limitValue, DEFAULT_LIMIT)

  if (limit > MAX_LIMIT) {
    throwInvalidPagination()
  }

  const skip = (page - 1) * limit

  if (!Number.isSafeInteger(skip)) {
    throwInvalidPagination()
  }

  return { page, limit, skip }
}

function parsePositiveInteger(value: unknown, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue
  }

  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) {
    return value
  }

  if (typeof value === 'string' && /^[1-9]\d*$/.test(value)) {
    const parsedValue = Number(value)

    if (Number.isSafeInteger(parsedValue)) {
      return parsedValue
    }
  }

  throwInvalidPagination()
}

function throwInvalidPagination(): never {
  throw new BadRequest('Invalid pagination parameters.', invalidPaginationCode)
}
