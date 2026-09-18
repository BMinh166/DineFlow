import { z } from 'zod'
import { assertValidObjectId } from './object-id.js'

export const createDishRequestSchema = z
  .object({
    categoryId: z.string().transform(assertValidObjectId),
    name: z.string().min(1),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    price: z.number().int().min(0),
  })
  .strict()

export type CreateDishRequest = z.infer<typeof createDishRequestSchema>
