import { Order } from '../models/order.js'
import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import type { OrderItemStatus } from '../types/order-item-status.js'
import type { TableSessionStatus } from '../types/table-session-status.js'
import { NotFound } from '../utils/app-error.js'
import type { ManagerHistoryQuery } from '../validators/manager-history.validator.js'

export interface ManagerHistoryOverviewDto {
  id: string
  status: 'CLOSED'
  closedAt: Date
  itemCount: number
  total: number
  table: {
    id: string
    number: number
  }
}

export interface ManagerHistoricalOrderDetailDto {
  id: string
  status: 'CLOSED'
  createdAt: Date
  closedAt: Date
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

type ClosedOrderForOverview = {
  _id: { toString(): string }
  tableSessionId: { toString(): string }
  status: 'CLOSED'
  closedAt: Date
  items: unknown[]
  total: number
}

type ClosedTableSessionForOverview = {
  _id: { toString(): string }
  tableId: { toString(): string }
}

type HistoricalTableForOverview = {
  _id: { toString(): string }
  number: number
}

type ClosedOrderForDetail = {
  _id: { toString(): string }
  tableSessionId: { toString(): string }
  status: 'CLOSED'
  createdAt: Date
  closedAt: Date
  total: number
  items: Array<{
    _id: { toString(): string }
    dishNameSnapshot: string
    unitPriceSnapshot: number
    quantity: number
    status: OrderItemStatus
  }>
}

type ClosedTableSessionForDetail = {
  _id: { toString(): string }
  tableId: { toString(): string }
  status: TableSessionStatus
}

type HistoricalTableForDetail = {
  _id: { toString(): string }
  number: number
}

function historicalOrderNotFoundError(): NotFound {
  return new NotFound('Historical order not found.', 'HISTORICAL_ORDER_NOT_FOUND')
}

function closedAtFilter({ dateFrom, dateTo }: ManagerHistoryQuery): Record<string, Date | true> {
  return {
    $exists: true,
    ...(dateFrom ? { $gte: dateFrom } : {}),
    ...(dateTo ? { $lt: dateTo } : {}),
  }
}

export async function listManagerHistory(
  query: ManagerHistoryQuery,
): Promise<ManagerHistoryOverviewDto[]> {
  const orders = await Order.find({
    status: 'CLOSED',
    closedAt: closedAtFilter(query),
  })
    .select('_id tableSessionId status closedAt items total')
    .sort({ closedAt: -1, _id: -1 })

  if (orders.length === 0) return []

  const tableSessions = await TableSession.find({
    _id: { $in: orders.map(order => order.tableSessionId) },
    status: 'CLOSED',
  }).select('_id tableId')
  const sessionsById = new Map(
    tableSessions.map((session: ClosedTableSessionForOverview) => [session._id.toString(), session]),
  )

  if (sessionsById.size === 0) return []

  const tables = await Table.find({
    _id: { $in: tableSessions.map(session => session.tableId) },
  }).select('_id number')
  const tablesById = new Map(
    tables.map((table: HistoricalTableForOverview) => [table._id.toString(), table]),
  )

  return (orders as unknown as ClosedOrderForOverview[]).flatMap(order => {
    const tableSession = sessionsById.get(order.tableSessionId.toString())
    const table = tableSession && tablesById.get(tableSession.tableId.toString())

    if (!tableSession || !table) return []

    return [{
      id: order._id.toString(),
      status: order.status,
      closedAt: order.closedAt,
      itemCount: order.items.length,
      total: order.total,
      table: {
        id: table._id.toString(),
        number: table.number,
      },
    }]
  })
}

export async function getManagerHistoricalOrder(
  orderId: string,
): Promise<ManagerHistoricalOrderDetailDto> {
  const order = await Order.findOne({
    _id: orderId,
    status: 'CLOSED',
    closedAt: { $exists: true },
  }).select('_id tableSessionId status createdAt closedAt total items')

  if (!order) throw historicalOrderNotFoundError()

  const historicalOrder = order as unknown as ClosedOrderForDetail
  const tableSession = await TableSession.findOne({
    _id: historicalOrder.tableSessionId,
    status: 'CLOSED',
  }).select('_id tableId status')

  if (!tableSession) throw historicalOrderNotFoundError()

  const historicalTableSession = tableSession as unknown as ClosedTableSessionForDetail
  const table = await Table.findById(historicalTableSession.tableId).select('_id number')

  if (!table) throw historicalOrderNotFoundError()

  const historicalTable = table as unknown as HistoricalTableForDetail
  return {
    id: historicalOrder._id.toString(),
    status: historicalOrder.status,
    createdAt: historicalOrder.createdAt,
    closedAt: historicalOrder.closedAt,
    total: historicalOrder.total,
    table: {
      id: historicalTable._id.toString(),
      number: historicalTable.number,
    },
    tableSession: {
      id: historicalTableSession._id.toString(),
      status: historicalTableSession.status,
    },
    items: historicalOrder.items.map(item => ({
      id: item._id.toString(),
      dishNameSnapshot: item.dishNameSnapshot,
      unitPriceSnapshot: item.unitPriceSnapshot,
      quantity: item.quantity,
      status: item.status,
    })),
  }
}
