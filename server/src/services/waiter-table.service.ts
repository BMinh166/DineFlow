import { Order } from '../models/order.js'
import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import type { OrderStatus } from '../types/order-status.js'
import type { TableSessionStatus } from '../types/table-session-status.js'
import type { TableStatus } from '../types/table-status.js'
import { NotFound } from '../utils/app-error.js'

export interface WaiterTableDto {
  id: string
  number: number
  status: TableStatus
  active: boolean
  hasActiveSession: boolean
  orderStatus: OrderStatus | null
}

export interface WaiterActiveTableSessionDto {
  table: {
    id: string
    number: number
    status: TableStatus
    active: boolean
  }
  session: {
    id: string
    status: TableSessionStatus
    joinCode: number
  }
}

type TableForDto = {
  _id: { toString(): string }
  number: number
  status: TableStatus
  active: boolean
}

type ActiveSessionForBoard = {
  _id: { toString(): string }
  tableId: { toString(): string }
  currentOrderId?: { toString(): string }
}

type OrderForBoard = {
  _id: { toString(): string }
  status: OrderStatus
}

type ActiveSessionForDetail = {
  _id: { toString(): string }
  status: TableSessionStatus
  joinCode: number
}

function toWaiterTableDto(
  table: TableForDto,
  sessionsByTableId: Map<string, ActiveSessionForBoard>,
  ordersById: Map<string, OrderForBoard>,
): WaiterTableDto {
  const session = sessionsByTableId.get(table._id.toString())
  const orderStatus = session?.currentOrderId
    ? ordersById.get(session.currentOrderId.toString())?.status ?? null
    : null

  return {
    id: table._id.toString(),
    number: table.number,
    status: table.status,
    active: table.active,
    hasActiveSession: Boolean(session),
    orderStatus,
  }
}

export async function listWaiterTables(): Promise<WaiterTableDto[]> {
  const tables = await Table.find()
    .select('_id number status active')
    .sort({ number: 1, _id: 1 })

  if (tables.length === 0) return []

  const activeSessions = await TableSession.find({
    tableId: { $in: tables.map(table => table._id) },
    status: 'ACTIVE',
  }).select('_id tableId currentOrderId')
  const sessionsByTableId = new Map(
    activeSessions.map((session: ActiveSessionForBoard) => [session.tableId.toString(), session]),
  )
  const currentOrderIds = activeSessions
    .map((session: ActiveSessionForBoard) => session.currentOrderId)
    .filter((orderId): orderId is { toString(): string } => Boolean(orderId))

  const orders = currentOrderIds.length === 0
    ? []
    : await Order.find({ _id: { $in: currentOrderIds } }).select('_id status')
  const ordersById = new Map(
    orders.map((order: OrderForBoard) => [order._id.toString(), order]),
  )

  return tables.map(table => toWaiterTableDto(table, sessionsByTableId, ordersById))
}

export async function getWaiterActiveTableSession(
  tableId: string,
): Promise<WaiterActiveTableSessionDto> {
  const table = await Table.findById(tableId).select('_id number status active')

  if (!table) {
    throw new NotFound('Table not found.', 'TABLE_NOT_FOUND')
  }

  const session = await TableSession.findOne({ tableId: table._id, status: 'ACTIVE' })
    .select('_id status joinCode')

  if (!session) {
    throw new NotFound('Active table session not found.', 'ACTIVE_TABLE_SESSION_NOT_FOUND')
  }

  const activeSession = session as unknown as ActiveSessionForDetail
  return {
    table: {
      id: table._id.toString(),
      number: table.number,
      status: table.status,
      active: table.active,
    },
    session: {
      id: activeSession._id.toString(),
      status: activeSession.status,
      joinCode: activeSession.joinCode,
    },
  }
}
