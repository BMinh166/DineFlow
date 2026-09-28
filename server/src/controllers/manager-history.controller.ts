import type { RequestHandler } from 'express'

import {
  getManagerHistoricalOrder,
  listManagerHistory,
} from '../services/manager-history.service.js'
import { successResponse } from '../utils/api-response.js'
import type { ManagerHistoryQuery } from '../validators/manager-history.validator.js'

function getValidatedHistoryQuery(response: { locals: { validated?: { query?: unknown } } }): ManagerHistoryQuery {
  return response.locals.validated?.query as ManagerHistoryQuery
}

function getValidatedOrderId(params: { orderId?: string | string[] }): string {
  return params.orderId as string
}

export const listManagerHistoryController: RequestHandler = async (_request, response) => {
  const orders = await listManagerHistory(getValidatedHistoryQuery(response))
  response.status(200).json(successResponse({ orders }))
}

export const getManagerHistoricalOrderController: RequestHandler = async (request, response) => {
  const order = await getManagerHistoricalOrder(getValidatedOrderId(request.params))
  response.status(200).json(successResponse({ order }))
}
