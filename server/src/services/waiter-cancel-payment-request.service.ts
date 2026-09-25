import mongoose from 'mongoose'

import { Order } from '../models/order.js'
import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import { Conflict, NotFound } from '../utils/app-error.js'

export interface WaiterCancelPaymentRequestResult {
  order: {
    id: string
    status: 'OPEN'
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
    return new Conflict('Order payment request has already been cancelled.', 'ORDER_ALREADY_OPEN')
  }

  if (status === 'CLOSED') {
    return new Conflict('Order is closed.', 'ORDER_CLOSED')
  }

  return new Conflict('Order is not awaiting payment.', 'ORDER_NOT_PAYMENT_REQUESTED')
}

export async function cancelWaiterPaymentRequest(
  tableId: string,
): Promise<WaiterCancelPaymentRequestResult> {
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
        .select('_id status')
        .session(transactionSession)

      if (!order) throw currentOrderNotFoundError()
      if (order.status !== 'PAYMENT_REQUESTED') throw orderNotPaymentRequestedError(order.status)

      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          tableSessionId: tableSession._id,
          status: 'PAYMENT_REQUESTED',
        },
        { $set: { status: 'OPEN' } },
        { new: true, session: transactionSession },
      ).select('_id status')

      if (!updatedOrder) {
        throw new Conflict('Order is no longer awaiting payment.', 'ORDER_NOT_PAYMENT_REQUESTED')
      }

      return {
        order: {
          id: updatedOrder._id.toString(),
          status: 'OPEN',
        },
      }
    })
  } finally {
    await transactionSession.endSession()
  }
}
