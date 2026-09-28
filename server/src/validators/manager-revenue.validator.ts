import { z } from 'zod'

import { BadRequest } from '../utils/app-error.js'

const vietnamUtcOffsetMilliseconds = 7 * 60 * 60 * 1000
const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const REVENUE_PERIODS = ['TODAY', 'LAST_7_DAYS', 'CUSTOM_RANGE'] as const
export type RevenuePeriod = (typeof REVENUE_PERIODS)[number]

export interface ManagerRevenueQuery {
  period: RevenuePeriod
  closedAtFrom: Date
  closedAtTo: Date
}

interface CalendarDate {
  year: number
  month: number
  day: number
}

function invalidRevenueDate(): BadRequest {
  return new BadRequest('Invalid revenue date.', 'INVALID_REVENUE_DATE')
}

function parseVietnamCalendarDate(value: string): CalendarDate {
  if (!datePattern.test(value)) throw invalidRevenueDate()

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw invalidRevenueDate()
  }

  return { year, month, day }
}

function addCalendarDays(value: CalendarDate, days: number): CalendarDate {
  const date = new Date(Date.UTC(value.year, value.month - 1, value.day + days))
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

function toVietnamStartOfDay(value: CalendarDate): Date {
  return new Date(Date.UTC(value.year, value.month - 1, value.day) - vietnamUtcOffsetMilliseconds)
}

function currentVietnamCalendarDate(): CalendarDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes): number => Number(
    parts.find(item => item.type === type)?.value,
  )

  return { year: part('year'), month: part('month'), day: part('day') }
}

function queryForPreset(period: Exclude<RevenuePeriod, 'CUSTOM_RANGE'>): ManagerRevenueQuery {
  const today = currentVietnamCalendarDate()
  const startDate = period === 'TODAY' ? today : addCalendarDays(today, -6)

  return {
    period,
    closedAtFrom: toVietnamStartOfDay(startDate),
    closedAtTo: toVietnamStartOfDay(addCalendarDays(today, 1)),
  }
}

export function getTodayManagerRevenueQuery(): ManagerRevenueQuery {
  return queryForPreset('TODAY')
}

const revenueQueryInputSchema = z.object({
  period: z.enum(REVENUE_PERIODS).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
}).strict()

export const managerRevenueQuerySchema = revenueQueryInputSchema.transform(({ period = 'TODAY', dateFrom, dateTo }) => {
  if (period !== 'CUSTOM_RANGE') {
    if (dateFrom || dateTo) {
      throw new BadRequest(
        'dateFrom and dateTo are only supported for CUSTOM_RANGE.',
        'INVALID_REVENUE_PERIOD_FILTER',
      )
    }

    return queryForPreset(period)
  }

  if (!dateFrom || !dateTo) {
    throw new BadRequest(
      'CUSTOM_RANGE requires dateFrom and dateTo.',
      'INVALID_REVENUE_CUSTOM_RANGE',
    )
  }

  const from = parseVietnamCalendarDate(dateFrom)
  const to = parseVietnamCalendarDate(dateTo)
  if (dateFrom > dateTo) {
    throw new BadRequest('dateFrom must not be after dateTo.', 'INVALID_REVENUE_DATE_RANGE')
  }

  return {
    period,
    closedAtFrom: toVietnamStartOfDay(from),
    closedAtTo: toVietnamStartOfDay(addCalendarDays(to, 1)),
  }
})
