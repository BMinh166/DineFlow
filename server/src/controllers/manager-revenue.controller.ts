import type { RequestHandler } from 'express'

import { getManagerRevenueSummary } from '../services/manager-revenue.service.js'
import { successResponse } from '../utils/api-response.js'
import type { ManagerRevenueQuery } from '../validators/manager-revenue.validator.js'

function getValidatedRevenueQuery(response: { locals: { validated?: { query?: unknown } } }): ManagerRevenueQuery {
  return response.locals.validated?.query as ManagerRevenueQuery
}

export const getManagerRevenueSummaryController: RequestHandler = async (_request, response) => {
  const summary = await getManagerRevenueSummary(getValidatedRevenueQuery(response))
  response.status(200).json(successResponse({ summary }))
}
