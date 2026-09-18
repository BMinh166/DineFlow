import { z } from 'zod'
import { assertValidObjectId } from './object-id.js'

export const createCategoryRequestSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
  })
  .strict()

export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>

export const updateCategoryRequestSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .strict()
  .refine(value => Object.keys(value).length > 0)

export const categoryIdParamsSchema = z.object({
  categoryId: z.string().transform(assertValidObjectId),
}).strict()

export type UpdateCategoryRequest = z.infer<typeof updateCategoryRequestSchema>
