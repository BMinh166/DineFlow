import type { RequestHandler } from 'express'

import { activateManagerTable, createManagerTable, deactivateManagerTable, listManagerTables, updateManagerTable } from '../services/table.service.js'
import { successResponse } from '../utils/api-response.js'
import type { CreateTableRequest, UpdateTableRequest } from '../validators/table.validator.js'

function getValidatedTableId(params: { tableId?: string | string[] }): string {
  return params.tableId as string
}

export const listManagerTablesController: RequestHandler = async (_request, response) => {
  const tables = await listManagerTables()
  response.status(200).json(successResponse({ tables }))
}

export const createManagerTableController: RequestHandler = async (request, response) => {
  const table = await createManagerTable(request.body as CreateTableRequest)
  response.status(201).json(successResponse({ table }))
}

export const updateManagerTableController: RequestHandler = async (request, response) => {
  const table = await updateManagerTable(getValidatedTableId(request.params), request.body as UpdateTableRequest)
  response.status(200).json(successResponse({ table }))
}

export const activateManagerTableController: RequestHandler = async (request, response) => {
  const table = await activateManagerTable(getValidatedTableId(request.params))
  response.status(200).json(successResponse({ table }))
}

export const deactivateManagerTableController: RequestHandler = async (request, response) => {
  const table = await deactivateManagerTable(getValidatedTableId(request.params))
  response.status(200).json(successResponse({ table }))
}
