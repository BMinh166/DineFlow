import mongoose from 'mongoose'

import { Order } from '../models/order.js'
import { TableSession } from '../models/table-session.js'
import type { OrderItemStatus } from '../types/order-item-status.js'
import { Conflict, NotFound } from '../utils/app-error.js'

type KitchenTransition = {
  expectedStatus: OrderItemStatus
  nextStatus: OrderItemStatus
}

export interface KitchenItemTransitionResult {
  item: {
    id: string
    status: OrderItemStatus
  }
}

function kitchenItemNotFoundError(): NotFound {
  return new NotFound('Kitchen order item not found.', 'KITCHEN_ITEM_NOT_FOUND')
}

function kitchenOrderNotEligibleError(): Conflict {
  return new Conflict('Order is not eligible for kitchen processing.', 'KITCHEN_ORDER_NOT_ELIGIBLE')
}

function kitchenItemTransitionConflictError(): Conflict {
  return new Conflict('Kitchen order item is no longer eligible for this transition.', 'KITCHEN_ITEM_TRANSITION_CONFLICT')
}

async function transitionKitchenItem(
  itemId: string,
  { expectedStatus, nextStatus }: KitchenTransition,
): Promise<KitchenItemTransitionResult> {
  const transactionSession = await mongoose.startSession()

  try {
    return await transactionSession.withTransaction(async () => {
      const targetOrder = await Order.findOne({ 'items._id': itemId })
        .select('_id tableSessionId status')
        .session(transactionSession)

      if (!targetOrder) throw kitchenItemNotFoundError()

      if (targetOrder.status !== 'OPEN' && targetOrder.status !== 'PAYMENT_REQUESTED') {
        throw kitchenOrderNotEligibleError()
      }

      const activeTableSession = await TableSession.findOneAndUpdate(
        {
          _id: targetOrder.tableSessionId,
          status: 'ACTIVE',
          currentOrderId: targetOrder._id,
        },
        { $set: { updatedAt: new Date() } },
        { new: true, session: transactionSession },
      ).select('_id')

      if (!activeTableSession) throw kitchenOrderNotEligibleError()

      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: targetOrder._id,
          tableSessionId: activeTableSession._id,
          status: { $in: ['OPEN', 'PAYMENT_REQUESTED'] },
          items: { $elemMatch: { _id: itemId, status: expectedStatus } },
        },
        { $set: { 'items.$.status': nextStatus } },
        { new: true, session: transactionSession },
      ).select('_id items._id items.status')

      if (!updatedOrder) throw kitchenItemTransitionConflictError()

      return {
        item: {
          id: itemId,
          status: nextStatus,
        },
      }
    })
  } finally {
    await transactionSession.endSession()
  }
}

export function startPreparingKitchenItem(itemId: string): Promise<KitchenItemTransitionResult> {
  return transitionKitchenItem(itemId, { expectedStatus: 'PENDING', nextStatus: 'PREPARING' })
}

export function markKitchenItemCompleted(itemId: string): Promise<KitchenItemTransitionResult> {
  return transitionKitchenItem(itemId, { expectedStatus: 'PREPARING', nextStatus: 'COMPLETED' })
}
