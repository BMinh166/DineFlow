import { z } from 'zod'

import { assertValidObjectId } from './object-id.js'

export const managerOrderIdParamsSchema = z.object({
  orderId: z.string().transform(assertValidObjectId),
})
