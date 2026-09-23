import { z } from 'zod'

import { assertValidObjectId } from './object-id.js'

export const kitchenItemIdParamsSchema = z.object({
  itemId: z.string().transform(assertValidObjectId),
}).strict()

export const kitchenItemActionRequestSchema = z.object({}).strict().optional()
