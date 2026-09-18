import { z } from 'zod'

export const createCategoryRequestSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
  })
  .strict()

export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>
