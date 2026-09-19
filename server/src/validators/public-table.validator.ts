import { z } from 'zod'

import { assertValidObjectId } from './object-id.js'

export const publicTableIdParamsSchema = z.object({
  tableId: z.string().transform(assertValidObjectId),
}).strict()
