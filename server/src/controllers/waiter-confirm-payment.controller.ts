import type { RequestHandler } from 'express'

import { confirmWaiterPayment } from '../services/waiter-confirm-payment.service.js'
import { successResponse } from '../utils/api-response.js'

function getValidatedTableId(params: { tableId?: string | string[] }): string {
  return params.tableId as string
}

export const confirmWaiterPaymentController: RequestHandler = async (request, response) => {
  const result = await confirmWaiterPayment(getValidatedTableId(request.params), request.auth!.userId)
  response.status(200).json(successResponse(result))
}
