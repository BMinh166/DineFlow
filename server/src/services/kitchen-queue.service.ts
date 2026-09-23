import { Order } from '../models/order.js'
import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import type { OrderItemStatus } from '../types/order-item-status.js'

export interface KitchenQueueTicketDto {
  orderId: string
  tableNumber: number
  orderedAt: string
  itemId: string
  dishNameSnapshot: string
  quantity: number
  status: OrderItemStatus
}

type QueueOrder = {
  _id: { toString(): string }
  tableSessionId: { toString(): string }
  items: Array<{
    _id: { toString(): string }
    dishNameSnapshot: string
    quantity: number
    status: OrderItemStatus
    createdAt: Date
  }>
}

type ActiveQueueSession = {
  _id: { toString(): string }
  tableId: { toString(): string }
  currentOrderId?: { toString(): string }
}

type QueueTable = {
  _id: { toString(): string }
  number: number
}

function toKitchenQueueTicket(
  order: QueueOrder,
  item: QueueOrder['items'][number],
  tableNumber: number,
): KitchenQueueTicketDto {
  return {
    orderId: order._id.toString(),
    tableNumber,
    orderedAt: item.createdAt.toISOString(),
    itemId: item._id.toString(),
    dishNameSnapshot: item.dishNameSnapshot,
    quantity: item.quantity,
    status: item.status,
  }
}

export async function listKitchenQueue(): Promise<KitchenQueueTicketDto[]> {
  const orders = await Order.find({ status: { $in: ['OPEN', 'PAYMENT_REQUESTED'] } })
    .select('_id tableSessionId items._id items.dishNameSnapshot items.quantity items.status items.createdAt')

  if (orders.length === 0) return []

  const activeSessions = await TableSession.find({
    _id: { $in: orders.map(order => order.tableSessionId) },
    status: 'ACTIVE',
  }).select('_id tableId currentOrderId')
  const sessionsById = new Map(
    activeSessions.map((session: ActiveQueueSession) => [session._id.toString(), session]),
  )

  if (sessionsById.size === 0) return []

  const tables = await Table.find({
    _id: { $in: activeSessions.map((session: ActiveQueueSession) => session.tableId) },
  }).select('_id number')
  const tablesById = new Map(
    tables.map((table: QueueTable) => [table._id.toString(), table]),
  )

  const tickets = (orders as unknown as QueueOrder[]).flatMap(order => {
    const tableSession = sessionsById.get(order.tableSessionId.toString())
    const table = tableSession ? tablesById.get(tableSession.tableId.toString()) : undefined

    return table && tableSession?.currentOrderId?.toString() === order._id.toString()
      ? order.items.map(item => toKitchenQueueTicket(order, item, table.number))
      : []
  })

  return tickets.sort((left, right) => {
    if (left.status === 'PENDING' && right.status === 'PENDING') {
      return new Date(left.orderedAt).getTime() - new Date(right.orderedAt).getTime()
    }

    if (left.status === 'PENDING') return -1
    if (right.status === 'PENDING') return 1
    return 0
  })
}
