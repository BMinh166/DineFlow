import type { RequestHandler } from 'express'

import {
  addWaiterOrderItems,
  getWaiterActiveTableSession,
  listWaiterTables,
  openWaiterTable,
} from '../services/waiter-table.service.js'
import { successResponse } from '../utils/api-response.js'
import type { AddCustomerOrderItemsRequest } from '../validators/customer-order.validator.js'

function getValidatedTableId(params: { tableId?: string | string[] }): string {
  return params.tableId as string
}

export const listWaiterTablesController: RequestHandler = async (_request, response) => {
  const tables = await listWaiterTables()
  response.status(200).json(successResponse({ tables }))
}

export const openWaiterTableController: RequestHandler = async (request, response) => {
  const result = await openWaiterTable(
    getValidatedTableId(request.params),
    request.auth!.userId,
  )
  response.status(201).json(successResponse(result))
}

export const getWaiterActiveTableSessionController: RequestHandler = async (request, response) => {
  const tableSession = await getWaiterActiveTableSession(getValidatedTableId(request.params))
  response.status(200).json(successResponse({ tableSession }))
}

export const addWaiterOrderItemsController: RequestHandler = async (request, response) => {
  const result = await addWaiterOrderItems(
    getValidatedTableId(request.params),
    request.body as AddCustomerOrderItemsRequest,
  )
  response.status(200).json(successResponse(result))
}
