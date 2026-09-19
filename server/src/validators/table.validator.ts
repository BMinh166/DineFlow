import { z } from 'zod'

export const createTableRequestSchema = z
  .object({
    number: z.number().int().positive(),
  })
  .strict()

export type CreateTableRequest = z.infer<typeof createTableRequestSchema>
