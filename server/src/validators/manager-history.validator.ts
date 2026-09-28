import { z } from 'zod'

import { BadRequest } from '../utils/app-error.js'
import { assertValidObjectId } from './object-id.js'

const vietnamUtcOffsetMilliseconds = 7 * 60 * 60 * 1000
const datePattern = /^\d{4}-\d{2}-\d{2}$/

export interface ManagerHistoryQuery {
  dateFrom?: Date
  dateTo?: Date
}

function parseVietnamCalendarDate(value: string): { year: number; month: number; day: number } {
  if (!datePattern.test(value)) {
    throw new BadRequest('Invalid history date.', 'INVALID_HISTORY_DATE')
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new BadRequest('Invalid history date.', 'INVALID_HISTORY_DATE')
  }

  return { year, month, day }
}

function toVietnamStartOfDay(value: string): Date {
  const { year, month, day } = parseVietnamCalendarDate(value)
  return new Date(Date.UTC(year, month - 1, day) - vietnamUtcOffsetMilliseconds)
}

function toVietnamStartOfFollowingDay(value: string): Date {
  const { year, month, day } = parseVietnamCalendarDate(value)
  return new Date(Date.UTC(year, month - 1, day + 1) - vietnamUtcOffsetMilliseconds)
}

const historyQueryInputSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
}).strict()

export const managerHistoryQuerySchema = historyQueryInputSchema.transform(({ dateFrom, dateTo }) => {
  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw new BadRequest('dateFrom must not be after dateTo.', 'INVALID_HISTORY_DATE_RANGE')
  }

  return {
    ...(dateFrom ? { dateFrom: toVietnamStartOfDay(dateFrom) } : {}),
    ...(dateTo ? { dateTo: toVietnamStartOfFollowingDay(dateTo) } : {}),
  }
})

export const managerHistoryOrderIdParamsSchema = z.object({
  orderId: z.string().transform(assertValidObjectId),
})
