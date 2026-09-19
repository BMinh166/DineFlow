import type { RequestHandler } from 'express'

import { getPublicTable } from '../services/public-table.service.js'
import { successResponse } from '../utils/api-response.js'

function getValidatedTableId(params: { tableId?: string | string[] }): string {
  return params.tableId as string
}

export const getPublicTableController: RequestHandler = async (request, response) => {
  const table = await getPublicTable(getValidatedTableId(request.params))
  response.status(200).json(successResponse({ table }))
}
