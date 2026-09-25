import mongoose from 'mongoose'

import { Order } from '../models/order.js'
import { TableSession } from '../models/table-session.js'
import { Conflict, Unauthorized } from '../utils/app-error.js'

type CustomerSessionIdentity = {
  tableId: string
  tableSessionId: string
}

export interface CustomerPaymentRequestResult {
  order: {
    id: string
    paymentRequestedAt: Date
    status: 'PAYMENT_REQUESTED'
  }
}

function customerSessionInactiveError(): Unauthorized {
  return new Unauthorized('Customer session is no longer active.', 'CUSTOMER_SESSION_INACTIVE')
}

function currentOrderNotFoundError(): Conflict {
  return new Conflict('Current order is unavailable.', 'CURRENT_ORDER_NOT_FOUND')
}

function invalidOrderStateError(status: string): Conflict {
  if (status === 'CLOSED') return new Conflict('Order is closed.', 'ORDER_CLOSED')
  return new Conflict('Order cannot request payment.', 'ORDER_NOT_OPEN')
}

function paymentRequestTimestampMissingError(): Conflict {
  return new Conflict('Payment request state is invalid.', 'PAYMENT_REQUEST_TIMESTAMP_MISSING')
}

function toPaymentRequestResult(order: {
  _id: { toString(): string }
  paymentRequestedAt?: Date
}): CustomerPaymentRequestResult {
  if (!order.paymentRequestedAt) throw paymentRequestTimestampMissingError()

  return {
    order: {
      id: order._id.toString(),
      paymentRequestedAt: order.paymentRequestedAt,
      status: 'PAYMENT_REQUESTED',
    },
  }
}

export async function requestCustomerOrderPayment(
  customerSession: CustomerSessionIdentity,
): Promise<CustomerPaymentRequestResult> {
  const transactionSession = await mongoose.startSession()

  try {
    return await transactionSession.withTransaction(async () => {
      const tableSession = await TableSession.findOne({
        _id: customerSession.tableSessionId,
        tableId: customerSession.tableId,
        status: 'ACTIVE',
      })
        .select('_id currentOrderId')
        .session(transactionSession)

      if (!tableSession) throw customerSessionInactiveError()
      if (!tableSession.currentOrderId) throw currentOrderNotFoundError()

      const order = await Order.findOne({
        _id: tableSession.currentOrderId,
        tableSessionId: tableSession._id,
      })
        .select('_id status paymentRequestedAt')
        .session(transactionSession)

      if (!order) throw currentOrderNotFoundError()
      if (order.status === 'PAYMENT_REQUESTED') return toPaymentRequestResult(order)
      if (order.status !== 'OPEN') throw invalidOrderStateError(order.status)

      const paymentRequestedAt = new Date()
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          tableSessionId: tableSession._id,
          status: 'OPEN',
        },
        {
          $set: {
            paymentRequestedAt,
            status: 'PAYMENT_REQUESTED',
          },
        },
        { new: true, session: transactionSession },
      ).select('_id status paymentRequestedAt')

      if (!updatedOrder) {
        throw new Conflict('Order is no longer open.', 'ORDER_NOT_OPEN')
      }

      return toPaymentRequestResult(updatedOrder)
    })
  } finally {
    await transactionSession.endSession()
  }
}
