import type { RequestHandler } from 'express'

import { getCustomerCurrentOrder } from '../services/customer-current-order.service.js'
import { successResponse } from '../utils/api-response.js'

export const getCustomerCurrentOrderController: RequestHandler = async (request, response) => {
  const result = await getCustomerCurrentOrder(request.customerSession!)
  response.status(200).json(successResponse(result))
}
