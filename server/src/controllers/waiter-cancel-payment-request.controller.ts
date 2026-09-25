import type { RequestHandler } from 'express'

import { cancelWaiterPaymentRequest } from '../services/waiter-cancel-payment-request.service.js'
import { successResponse } from '../utils/api-response.js'

function getValidatedTableId(params: { tableId?: string | string[] }): string {
  return params.tableId as string
}

export const cancelWaiterPaymentRequestController: RequestHandler = async (request, response) => {
  const result = await cancelWaiterPaymentRequest(getValidatedTableId(request.params))
  response.status(200).json(successResponse(result))
}
