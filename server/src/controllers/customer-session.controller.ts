import type { RequestHandler } from 'express'

import { joinCustomerTable } from '../services/customer-session.service.js'
import { successResponse } from '../utils/api-response.js'
import type { CustomerJoinRequest } from '../validators/customer-session.validator.js'

function getValidatedTableId(params: { tableId?: string | string[] }): string {
  return params.tableId as string
}

export const joinCustomerTableController: RequestHandler = async (request, response) => {
  const result = await joinCustomerTable(
    getValidatedTableId(request.params),
    request.body as CustomerJoinRequest,
  )
  response.status(200).json(successResponse(result))
}

export const getCustomerSessionController: RequestHandler = (request, response) => {
  const { tableId, tableSessionId } = request.customerSession!
  response.status(200).json(successResponse({ session: { tableId, tableSessionId } }))
}
