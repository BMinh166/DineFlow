import type { RequestHandler } from 'express'

import { requestCustomerOrderPayment } from '../services/customer-payment-request.service.js'
import { successResponse } from '../utils/api-response.js'

export const requestCustomerOrderPaymentController: RequestHandler = async (request, response) => {
  const result = await requestCustomerOrderPayment(request.customerSession!)
  response.status(200).json(successResponse(result))
}
