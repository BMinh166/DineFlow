import { Order } from '../models/order.js'
import { TableSession } from '../models/table-session.js'
import type { OrderItemStatus } from '../types/order-item-status.js'
import type { OrderStatus } from '../types/order-status.js'
import { Conflict, Unauthorized } from '../utils/app-error.js'

type CustomerSessionIdentity = {
  tableId: string
  tableSessionId: string
}

export interface CustomerCurrentOrderResult {
  order: {
    id: string
    items: Array<{
      id: string
      dishName: string
      quantity: number
      status: OrderItemStatus
      unitPrice: number
    }>
    status: OrderStatus
    total: number
  }
}

function customerSessionInactiveError(): Unauthorized {
  return new Unauthorized('Customer session is no longer active.', 'CUSTOMER_SESSION_INACTIVE')
}

function currentOrderNotFoundError(): Conflict {
  return new Conflict('Current order is unavailable.', 'CURRENT_ORDER_NOT_FOUND')
}

export async function getCustomerCurrentOrder(
  customerSession: CustomerSessionIdentity,
): Promise<CustomerCurrentOrderResult> {
  const tableSession = await TableSession.findOne({
    _id: customerSession.tableSessionId,
    tableId: customerSession.tableId,
    status: 'ACTIVE',
  }).select('_id currentOrderId')

  if (!tableSession) throw customerSessionInactiveError()
  if (!tableSession.currentOrderId) throw currentOrderNotFoundError()

  const order = await Order.findOne({
    _id: tableSession.currentOrderId,
    tableSessionId: tableSession._id,
  }).select('_id items status total')

  if (!order) throw currentOrderNotFoundError()

  return {
    order: {
      id: order._id.toString(),
      status: order.status,
      total: order.total,
      items: order.items.map(item => ({
        id: item._id.toString(),
        dishName: item.dishNameSnapshot,
        unitPrice: item.unitPriceSnapshot,
        quantity: item.quantity,
        status: item.status,
      })),
    },
  }
}
