import { z } from 'zod'
import { assertValidObjectId } from './object-id.js'

export const createTableRequestSchema = z
  .object({
    number: z.number().int().positive(),
  })
  .strict()

export type CreateTableRequest = z.infer<typeof createTableRequestSchema>

export const updateTableRequestSchema = z
  .object({
    number: z.number().int().positive(),
  })
  .strict()

export type UpdateTableRequest = z.infer<typeof updateTableRequestSchema>

export const tableIdParamsSchema = z.object({
  tableId: z.string().transform(assertValidObjectId),
}).strict()

export const openTableRequestSchema = z.object({}).strict().optional()
