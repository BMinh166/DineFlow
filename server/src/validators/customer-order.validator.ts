import { z } from 'zod'

import { assertValidObjectId } from './object-id.js'

const customerOrderItemSchema = z.object({
  dishId: z.string().transform(assertValidObjectId),
  quantity: z.number().int().min(1).max(99),
}).strict()

export const addCustomerOrderItemsRequestSchema = z.object({
  items: z.array(customerOrderItemSchema).min(1),
}).strict().superRefine(({ items }, context) => {
  const dishIds = new Set<string>()

  items.forEach((item, index) => {
    if (dishIds.has(item.dishId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duplicate dishId.',
        path: ['items', index, 'dishId'],
      })
      return
    }

    dishIds.add(item.dishId)
  })
})

export type AddCustomerOrderItemsRequest = z.infer<typeof addCustomerOrderItemsRequestSchema>

export const requestCustomerOrderPaymentRequestSchema = z.object({}).strict().optional()
