import type { RequestHandler } from 'express'

import {
  getWaiterActiveTableSession,
  listWaiterTables,
} from '../services/waiter-table.service.js'
import { successResponse } from '../utils/api-response.js'

function getValidatedTableId(params: { tableId?: string | string[] }): string {
  return params.tableId as string
}

export const listWaiterTablesController: RequestHandler = async (_request, response) => {
  const tables = await listWaiterTables()
  response.status(200).json(successResponse({ tables }))
}

export const getWaiterActiveTableSessionController: RequestHandler = async (request, response) => {
  const tableSession = await getWaiterActiveTableSession(getValidatedTableId(request.params))
  response.status(200).json(successResponse({ tableSession }))
}
