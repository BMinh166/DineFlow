import type { RequestHandler } from 'express'

import { createManagerTable, listManagerTables } from '../services/table.service.js'
import { successResponse } from '../utils/api-response.js'
import type { CreateTableRequest } from '../validators/table.validator.js'

export const listManagerTablesController: RequestHandler = async (_request, response) => {
  const tables = await listManagerTables()
  response.status(200).json(successResponse({ tables }))
}

export const createManagerTableController: RequestHandler = async (request, response) => {
  const table = await createManagerTable(request.body as CreateTableRequest)
  response.status(201).json(successResponse({ table }))
}
