import type { RequestHandler } from 'express'

import {
  getManagerCurrentOrder,
  listManagerCurrentOrders,
} from '../services/manager-current-order.service.js'
import { successResponse } from '../utils/api-response.js'

function getValidatedOrderId(params: { orderId?: string | string[] }): string {
  return params.orderId as string
}

export const listManagerCurrentOrdersController: RequestHandler = async (_request, response) => {
  const orders = await listManagerCurrentOrders()
  response.status(200).json(successResponse({ orders }))
}

export const getManagerCurrentOrderController: RequestHandler = async (request, response) => {
  const order = await getManagerCurrentOrder(getValidatedOrderId(request.params))
  response.status(200).json(successResponse({ order }))
}
