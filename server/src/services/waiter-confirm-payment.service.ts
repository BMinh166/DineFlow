import mongoose from 'mongoose'

import { Order } from '../models/order.js'
import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import { Conflict, NotFound } from '../utils/app-error.js'

export interface WaiterConfirmPaymentResult {
  order: {
    id: string
    status: 'CLOSED'
  }
  session: {
    id: string
    status: 'CLOSED'
  }
  table: {
    id: string
    status: 'AVAILABLE'
  }
}

function tableInactiveError(): Conflict {
  return new Conflict('Inactive tables cannot be used.', 'TABLE_INACTIVE')
}

function tableNotOccupiedError(): Conflict {
  return new Conflict('Table is not occupied.', 'TABLE_NOT_OCCUPIED')
}

function currentOrderNotFoundError(): Conflict {
  return new Conflict('Current order is unavailable.', 'CURRENT_ORDER_NOT_FOUND')
}

function orderNotPaymentRequestedError(status: string): Conflict {
  if (status === 'OPEN') {
    return new Conflict('Order is not awaiting payment.', 'ORDER_NOT_PAYMENT_REQUESTED')
  }

  if (status === 'CLOSED') {
    return new Conflict('Order is closed.', 'ORDER_CLOSED')
  }

  return new Conflict('Order is not awaiting payment.', 'ORDER_NOT_PAYMENT_REQUESTED')
}

function orderItemsNotCompletedError(): Conflict {
  return new Conflict('All order items must be completed before payment confirmation.', 'ORDER_ITEMS_NOT_COMPLETED')
}

function paymentConfirmationConflictError(): Conflict {
  return new Conflict('Payment confirmation state has changed. Please refresh and try again.', 'PAYMENT_CONFIRMATION_CONFLICT')
}

export async function confirmWaiterPayment(
  tableId: string,
  confirmedBy: string,
): Promise<WaiterConfirmPaymentResult> {
  const transactionSession = await mongoose.startSession()

  try {
    return await transactionSession.withTransaction(async () => {
      const table = await Table.findById(tableId)
        .select('_id status active')
        .session(transactionSession)

      if (!table) throw new NotFound('Table not found.', 'TABLE_NOT_FOUND')
      if (!table.active) throw tableInactiveError()
      if (table.status !== 'OCCUPIED') throw tableNotOccupiedError()

      const tableSession = await TableSession.findOne({
        tableId: table._id,
        status: 'ACTIVE',
      })
        .select('_id currentOrderId')
        .session(transactionSession)

      if (!tableSession) {
        throw new NotFound('Active table session not found.', 'ACTIVE_TABLE_SESSION_NOT_FOUND')
      }
      if (!tableSession.currentOrderId) throw currentOrderNotFoundError()

      const order = await Order.findOne({
        _id: tableSession.currentOrderId,
        tableSessionId: tableSession._id,
      })
        .select('_id status items.status')
        .session(transactionSession)

      if (!order) throw currentOrderNotFoundError()
      if (order.status !== 'PAYMENT_REQUESTED') throw orderNotPaymentRequestedError(order.status)
      if (order.items.some(item => item.status !== 'COMPLETED')) throw orderItemsNotCompletedError()

      const closedAt = new Date()
      const closedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          tableSessionId: tableSession._id,
          status: 'PAYMENT_REQUESTED',
          items: { $not: { $elemMatch: { status: { $ne: 'COMPLETED' } } } },
        },
        {
          $set: {
            closedAt,
            closedBy: confirmedBy,
            status: 'CLOSED',
          },
        },
        { new: true, session: transactionSession },
      ).select('_id status')

      if (!closedOrder) throw paymentConfirmationConflictError()

      const closedTableSession = await TableSession.findOneAndUpdate(
        {
          _id: tableSession._id,
          tableId: table._id,
          status: 'ACTIVE',
          currentOrderId: closedOrder._id,
        },
        {
          $set: {
            closedAt,
            closedBy: confirmedBy,
            status: 'CLOSED',
          },
        },
        { new: true, session: transactionSession },
      ).select('_id status')

      if (!closedTableSession) throw paymentConfirmationConflictError()

      const releasedTable = await Table.findOneAndUpdate(
        {
          _id: table._id,
          active: true,
          status: 'OCCUPIED',
        },
        { $set: { status: 'AVAILABLE' } },
        { new: true, session: transactionSession },
      ).select('_id status')

      if (!releasedTable) throw paymentConfirmationConflictError()

      return {
        order: {
          id: closedOrder._id.toString(),
          status: 'CLOSED',
        },
        session: {
          id: closedTableSession._id.toString(),
          status: 'CLOSED',
        },
        table: {
          id: releasedTable._id.toString(),
          status: 'AVAILABLE',
        },
      }
    })
  } finally {
    await transactionSession.endSession()
  }
}
