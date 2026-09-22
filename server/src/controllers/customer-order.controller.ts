import type { RequestHandler } from 'express'

import { addCustomerOrderItems } from '../services/customer-order.service.js'
import { successResponse } from '../utils/api-response.js'
import type { AddCustomerOrderItemsRequest } from '../validators/customer-order.validator.js'

export const addCustomerOrderItemsController: RequestHandler = async (request, response) => {
  const result = await addCustomerOrderItems(
    request.customerSession!,
    request.body as AddCustomerOrderItemsRequest,
  )
  response.status(200).json(successResponse(result))
}
