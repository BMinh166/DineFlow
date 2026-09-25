import { Order } from '../models/order.js'
import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import { Conflict, NotFound } from '../utils/app-error.js'

export interface WaiterCancelPaymentRequestResult {
  order: {
    id: string
    status: 'OPEN'
    total: number
  }
}

function currentOrderNotFoundError(): Conflict {
  return new Conflict('Current order is unavailable.', 'CURRENT_ORDER_NOT_FOUND')
}

export async function cancelWaiterPaymentRequest(
  tableId: string,
): Promise<WaiterCancelPaymentRequestResult> {
  const table = await Table.findById(tableId).select('_id status active')

  if (!table) throw new NotFound('Table not found.', 'TABLE_NOT_FOUND')
  if (!table.active) throw new Conflict('Table is inactive.', 'TABLE_INACTIVE')
  if (table.status !== 'OCCUPIED') {
    throw new Conflict('Table is not occupied.', 'TABLE_NOT_OCCUPIED')
  }

  const tableSession = await TableSession.findOne({
    tableId: table._id,
    status: 'ACTIVE',
  }).select('_id currentOrderId')

  if (!tableSession) {
    throw new NotFound('Active table session not found.', 'ACTIVE_TABLE_SESSION_NOT_FOUND')
  }
  if (!tableSession.currentOrderId) throw currentOrderNotFoundError()

  const currentOrder = await Order.findOne({
    _id: tableSession.currentOrderId,
    tableSessionId: tableSession._id,
  }).select('_id status')

  if (!currentOrder) throw currentOrderNotFoundError()
  if (currentOrder.status !== 'PAYMENT_REQUESTED') {
    if (currentOrder.status === 'OPEN') {
      throw new Conflict('Order is already open.', 'ORDER_ALREADY_OPEN')
    }
    if (currentOrder.status === 'CLOSED') {
      throw new Conflict('Order is closed.', 'ORDER_CLOSED')
    }
    throw new Conflict('Order is not awaiting payment.', 'ORDER_NOT_PAYMENT_REQUESTED')
  }

  // The status predicate makes this transition safe against a concurrent state change.
  // Cancelling payment must not mutate the table, session, items, kitchen statuses, or total.
  const reopenedOrder = await Order.findOneAndUpdate(
    {
      _id: currentOrder._id,
      tableSessionId: tableSession._id,
      status: 'PAYMENT_REQUESTED',
    },
    {
      $set: { status: 'OPEN' },
      $unset: { paymentRequestedAt: 1 },
    },
    { new: true },
  ).select('_id status total')

  if (!reopenedOrder) {
    throw new Conflict(
      'Payment request can no longer be cancelled.',
      'CANCEL_PAYMENT_REQUEST_CONFLICT',
    )
  }

  return {
    order: {
      id: reopenedOrder._id.toString(),
      status: 'OPEN',
      total: reopenedOrder.total,
    },
  }
}
