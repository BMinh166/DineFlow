import { Order } from '../models/order.js'
import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import type { OrderItemStatus } from '../types/order-item-status.js'
import type { OrderStatus } from '../types/order-status.js'
import type { TableSessionStatus } from '../types/table-session-status.js'
import { NotFound } from '../utils/app-error.js'

export interface ManagerCurrentOrderOverviewDto {
  id: string
  status: OrderStatus
  createdAt: Date
  itemCount: number
  total: number
  table: {
    id: string
    number: number
  }
}

export interface ManagerCurrentOrderDetailDto {
  id: string
  status: OrderStatus
  createdAt: Date
  total: number
  table: {
    id: string
    number: number
  }
  tableSession: {
    id: string
    status: TableSessionStatus
  }
  items: Array<{
    id: string
    dishNameSnapshot: string
    unitPriceSnapshot: number
    quantity: number
    status: OrderItemStatus
  }>
}

type CurrentOrderForOverview = {
  _id: { toString(): string }
  tableSessionId: { toString(): string }
  status: OrderStatus
  items: unknown[]
  total: number
  createdAt: Date
}

type ActiveSessionForOverview = {
  _id: { toString(): string }
  tableId: { toString(): string }
  currentOrderId?: { toString(): string }
}

type OccupiedTableForOverview = {
  _id: { toString(): string }
  number: number
}

type CurrentOrderForDetail = {
  _id: { toString(): string }
  tableSessionId: { toString(): string }
  status: OrderStatus
  createdAt: Date
  total: number
  items: Array<{
    _id: { toString(): string }
    dishNameSnapshot: string
    unitPriceSnapshot: number
    quantity: number
    status: OrderItemStatus
  }>
}

type ActiveSessionForDetail = {
  _id: { toString(): string }
  tableId: { toString(): string }
  status: TableSessionStatus
}

type OccupiedTableForDetail = {
  _id: { toString(): string }
  number: number
}

function currentOrderNotFoundError(): NotFound {
  return new NotFound('Current order not found.', 'CURRENT_ORDER_NOT_FOUND')
}

export async function listManagerCurrentOrders(): Promise<ManagerCurrentOrderOverviewDto[]> {
  const activeSessions = await TableSession.find({
    status: 'ACTIVE',
    currentOrderId: { $exists: true },
  }).select('_id tableId currentOrderId')

  if (activeSessions.length === 0) return []

  const occupiedTables = await Table.find({
    _id: { $in: activeSessions.map(session => session.tableId) },
    status: 'OCCUPIED',
  }).select('_id number')
  const tablesById = new Map(
    occupiedTables.map((table: OccupiedTableForOverview) => [table._id.toString(), table]),
  )
  const sessionsByCurrentOrderId = new Map(
    (activeSessions as unknown as ActiveSessionForOverview[])
      .filter((session): session is ActiveSessionForOverview & { currentOrderId: { toString(): string } } => (
        Boolean(session.currentOrderId) && tablesById.has(session.tableId.toString())
      ))
      .map(session => [session.currentOrderId.toString(), session]),
  )

  if (sessionsByCurrentOrderId.size === 0) return []

  const orders = await Order.find({
    _id: { $in: [...sessionsByCurrentOrderId.keys()] },
    status: { $in: ['OPEN', 'PAYMENT_REQUESTED'] },
  })
    .select('_id tableSessionId status items total createdAt')
    .sort({ createdAt: -1, _id: -1 })

  return (orders as unknown as CurrentOrderForOverview[]).flatMap(order => {
    const tableSession = sessionsByCurrentOrderId.get(order._id.toString())
    const table = tableSession && tablesById.get(tableSession.tableId.toString())

    if (!tableSession || !table || tableSession._id.toString() !== order.tableSessionId.toString()) {
      return []
    }

    return [{
      id: order._id.toString(),
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.items.length,
      total: order.total,
      table: {
        id: table._id.toString(),
        number: table.number,
      },
    }]
  })
}

export async function getManagerCurrentOrder(
  orderId: string,
): Promise<ManagerCurrentOrderDetailDto> {
  const order = await Order.findOne({
    _id: orderId,
    status: { $in: ['OPEN', 'PAYMENT_REQUESTED'] },
  }).select('_id tableSessionId status createdAt total items')

  if (!order) throw currentOrderNotFoundError()

  const currentOrder = order as unknown as CurrentOrderForDetail
  const tableSession = await TableSession.findOne({
    _id: currentOrder.tableSessionId,
    status: 'ACTIVE',
    currentOrderId: currentOrder._id,
  }).select('_id tableId status')

  if (!tableSession) throw currentOrderNotFoundError()

  const activeTableSession = tableSession as unknown as ActiveSessionForDetail
  const table = await Table.findOne({
    _id: activeTableSession.tableId,
    status: 'OCCUPIED',
  }).select('_id number')

  if (!table) throw currentOrderNotFoundError()

  const occupiedTable = table as unknown as OccupiedTableForDetail
  return {
    id: currentOrder._id.toString(),
    status: currentOrder.status,
    createdAt: currentOrder.createdAt,
    total: currentOrder.total,
    table: {
      id: occupiedTable._id.toString(),
      number: occupiedTable.number,
    },
    tableSession: {
      id: activeTableSession._id.toString(),
      status: activeTableSession.status,
    },
    items: currentOrder.items.map(item => ({
      id: item._id.toString(),
      dishNameSnapshot: item.dishNameSnapshot,
      unitPriceSnapshot: item.unitPriceSnapshot,
      quantity: item.quantity,
      status: item.status,
    })),
  }
}
