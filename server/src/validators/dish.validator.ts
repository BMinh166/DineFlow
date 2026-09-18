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

export const updateDishRequestSchema = z
  .object({
    categoryId: z.string().transform(assertValidObjectId).optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    price: z.number().int().min(0).optional(),
  })
  .strict()
  .refine(value => Object.keys(value).length > 0)

export const dishIdParamsSchema = z.object({
  dishId: z.string().transform(assertValidObjectId),
}).strict()

export type UpdateDishRequest = z.infer<typeof updateDishRequestSchema>
