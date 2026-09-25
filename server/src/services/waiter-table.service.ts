import { randomInt } from 'node:crypto'
import mongoose, { Types, type ClientSession } from 'mongoose'

import { Category } from '../models/category.js'
import { Dish } from '../models/dish.js'
import { Order } from '../models/order.js'
import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import type { OrderItemStatus } from '../types/order-item-status.js'
import type { OrderStatus } from '../types/order-status.js'
import type { TableSessionStatus } from '../types/table-session-status.js'
import type { TableStatus } from '../types/table-status.js'
import { Conflict, NotFound } from '../utils/app-error.js'
import type { AddCustomerOrderItemsRequest } from '../validators/customer-order.validator.js'

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
    openedAt: Date
    openedBy: {
      id: string
      name: string
    }
  }
  order: {
    id: string
    status: OrderStatus
    total: number
    itemCount: number
    items: Array<{
      id: string
      dishNameSnapshot: string
      unitPriceSnapshot: number
      quantity: number
      status: OrderItemStatus
    }>
  }
}

export interface OpenWaiterTableResult {
  table: {
    id: string
    number: number
    status: TableStatus
  }
  session: {
    id: string
    status: 'ACTIVE'
    joinCode: number
  }
  order: {
    id: string
    status: 'OPEN'
  }
}

export interface WaiterAddOrderItemsResult {
  order: {
    id: string
    status: 'OPEN'
    total: number
  }
}

type NewOrderItem = {
  dishId: Types.ObjectId
  dishNameSnapshot: string
  quantity: number
  status: 'PENDING'
  unitPriceSnapshot: number
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
  openedAt: Date
  openedBy: {
    _id: { toString(): string }
    name: string
  } | null
  currentOrderId?: { toString(): string }
}

type CurrentOrderForDetail = {
  _id: { toString(): string }
  status: OrderStatus
  total: number
  items: Array<{
    _id: { toString(): string }
    dishNameSnapshot: string
    unitPriceSnapshot: number
    quantity: number
    status: OrderItemStatus
  }>
}

type OpenedTable = {
  _id: { toString(): string }
  number: number
  status: TableStatus
}

type OpenedTableSession = {
  _id: { toString(): string }
  status: 'ACTIVE'
  joinCode: number
}

type OpenedOrder = {
  _id: { toString(): string }
  status: 'OPEN'
}

const joinCodeGenerationAttempts = 20

function activeSessionExistsError(): Conflict {
  return new Conflict('Table already has an active session.', 'TABLE_HAS_ACTIVE_SESSION')
}

function tableInactiveError(): Conflict {
  return new Conflict('Inactive tables cannot be opened.', 'TABLE_INACTIVE')
}

function tableOccupiedError(): Conflict {
  return new Conflict('Table is already occupied.', 'TABLE_ALREADY_OCCUPIED')
}

function tableOpenConflictError(): Conflict {
  return new Conflict('Table is no longer available to open.', 'TABLE_OPEN_CONFLICT')
}

function currentOrderNotFoundError(): Conflict {
  return new Conflict('Current order is unavailable.', 'CURRENT_ORDER_NOT_FOUND')
}

function tableSessionInconsistentError(): Conflict {
  return new Conflict('Active table session is inconsistent.', 'ACTIVE_TABLE_SESSION_INCONSISTENT')
}

function tableNotOccupiedError(): Conflict {
  return new Conflict('Table is not occupied.', 'TABLE_NOT_OCCUPIED')
}

function orderNotOpenError(status: string): Conflict {
  if (status === 'PAYMENT_REQUESTED') {
    return new Conflict('Order is awaiting payment.', 'ORDER_PAYMENT_REQUESTED')
  }

  if (status === 'CLOSED') {
    return new Conflict('Order is closed.', 'ORDER_CLOSED')
  }

  return new Conflict('Order is not open.', 'ORDER_NOT_OPEN')
}

function invalidStoredPriceError(): Conflict {
  return new Conflict('Dish price is invalid.', 'DISH_PRICE_INVALID')
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 11000
}

function generateJoinCode(): number {
  return randomInt(1000, 10_000)
}

async function generateUniqueJoinCode(
  tableId: { toString(): string },
  transactionSession: ClientSession,
): Promise<number> {
  for (let attempt = 0; attempt < joinCodeGenerationAttempts; attempt += 1) {
    const joinCode = generateJoinCode()
    const existingSession = await TableSession.exists({ tableId, joinCode }).session(transactionSession)

    if (!existingSession) {
      return joinCode
    }
  }

  throw new Conflict('Unable to generate a new join code.', 'JOIN_CODE_GENERATION_EXHAUSTED')
}

function toOpenWaiterTableResult(
  table: OpenedTable,
  tableSession: OpenedTableSession,
  order: OpenedOrder,
): OpenWaiterTableResult {
  return {
    table: {
      id: table._id.toString(),
      number: table.number,
      status: table.status,
    },
    session: {
      id: tableSession._id.toString(),
      status: tableSession.status,
      joinCode: tableSession.joinCode,
    },
    order: {
      id: order._id.toString(),
      status: order.status,
    },
  }
}

async function openTableInTransaction(
  tableId: string,
  openedBy: string,
  transactionSession: ClientSession,
): Promise<OpenWaiterTableResult> {
  const table = await Table.findById(tableId)
    .select('_id number status active')
    .session(transactionSession)

  if (!table) {
    throw new NotFound('Table not found.', 'TABLE_NOT_FOUND')
  }

  if (!table.active) {
    throw tableInactiveError()
  }

  if (table.status === 'OCCUPIED') {
    throw tableOccupiedError()
  }

  const hasActiveSession = await TableSession.exists({ tableId: table._id, status: 'ACTIVE' })
    .session(transactionSession)
  if (hasActiveSession) {
    throw activeSessionExistsError()
  }

  const openedTable = await Table.findOneAndUpdate(
    { _id: table._id, active: true, status: 'AVAILABLE' },
    { $set: { status: 'OCCUPIED' } },
    { new: true, session: transactionSession },
  ).select('_id number status')

  if (!openedTable) {
    throw tableOpenConflictError()
  }

  const [tableSession] = await TableSession.create(
    [{
      tableId: openedTable._id,
      joinCode: await generateUniqueJoinCode(openedTable._id, transactionSession),
      status: 'ACTIVE',
      openedBy,
    }],
    { session: transactionSession },
  )
  const [order] = await Order.create(
    [{ tableSessionId: tableSession._id, status: 'OPEN' }],
    { session: transactionSession },
  )
  const linkResult = await TableSession.updateOne(
    { _id: tableSession._id, status: 'ACTIVE', currentOrderId: { $exists: false } },
    { $set: { currentOrderId: order._id } },
    { session: transactionSession },
  )

  if (linkResult.matchedCount !== 1) {
    throw tableOpenConflictError()
  }

  return toOpenWaiterTableResult(
    openedTable as unknown as OpenedTable,
    tableSession as unknown as OpenedTableSession,
    order as unknown as OpenedOrder,
  )
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

  if (!table.active) {
    throw new NotFound('Table is inactive.', 'TABLE_INACTIVE')
  }

  if (table.status !== 'OCCUPIED') {
    throw new Conflict('Table is not occupied.', 'TABLE_NOT_OCCUPIED')
  }

  const session = await TableSession.findOne({ tableId: table._id, status: 'ACTIVE' })
    .select('_id status joinCode openedAt openedBy currentOrderId')
    .populate('openedBy', '_id name')

  if (!session) {
    throw new NotFound('Active table session not found.', 'ACTIVE_TABLE_SESSION_NOT_FOUND')
  }

  const activeSession = session as unknown as ActiveSessionForDetail
  if (!activeSession.openedBy) {
    throw tableSessionInconsistentError()
  }

  if (!activeSession.currentOrderId) {
    throw currentOrderNotFoundError()
  }

  const order = await Order.findOne({
    _id: activeSession.currentOrderId,
    tableSessionId: activeSession._id,
  }).select('_id status total items')

  if (!order) {
    throw currentOrderNotFoundError()
  }

  const currentOrder = order as unknown as CurrentOrderForDetail
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
      openedAt: activeSession.openedAt,
      openedBy: {
        id: activeSession.openedBy._id.toString(),
        name: activeSession.openedBy.name,
      },
    },
    order: {
      id: currentOrder._id.toString(),
      status: currentOrder.status,
      total: currentOrder.total,
      itemCount: currentOrder.items.length,
      items: currentOrder.items.map(item => ({
        id: item._id.toString(),
        dishNameSnapshot: item.dishNameSnapshot,
        unitPriceSnapshot: item.unitPriceSnapshot,
        quantity: item.quantity,
        status: item.status,
      })),
    },
  }
}

export async function openWaiterTable(
  tableId: string,
  openedBy: string,
): Promise<OpenWaiterTableResult> {
  const transactionSession = await mongoose.startSession()

  try {
    return await transactionSession.withTransaction(() =>
      openTableInTransaction(tableId, openedBy, transactionSession),
    )
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw activeSessionExistsError()
    }

    throw error
  } finally {
    await transactionSession.endSession()
  }
}

export async function addWaiterOrderItems(
  tableId: string,
  { items }: AddCustomerOrderItemsRequest,
): Promise<WaiterAddOrderItemsResult> {
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
      if (order.status !== 'OPEN') throw orderNotOpenError(order.status)

      const dishIds = items.map(item => item.dishId)
      const dishes = await Dish.find({ _id: { $in: dishIds } })
        .select('_id categoryId name price isActive isAvailable')
        .session(transactionSession)
      const dishesById = new Map(dishes.map(dish => [dish._id.toString(), dish]))

      const activeCategories = await Category.find({
        _id: { $in: dishes.map(dish => dish.categoryId) },
        active: true,
      })
        .select('_id')
        .session(transactionSession)
      const activeCategoryIds = new Set(activeCategories.map(category => category._id.toString()))

      const newItems: NewOrderItem[] = items.map(item => {
        const dish = dishesById.get(item.dishId)
        if (!dish) throw new NotFound('Dish not found.', 'DISH_NOT_FOUND')
        if (!dish.isActive) throw new Conflict('Dish is inactive.', 'DISH_INACTIVE')
        if (!dish.isAvailable) throw new Conflict('Dish is unavailable.', 'DISH_UNAVAILABLE')
        if (!activeCategoryIds.has(dish.categoryId.toString())) {
          throw new Conflict('Dish category is inactive.', 'DISH_CATEGORY_INACTIVE')
        }
        if (!Number.isSafeInteger(dish.price) || dish.price < 0) throw invalidStoredPriceError()

        return {
          dishId: dish._id,
          dishNameSnapshot: dish.name,
          quantity: item.quantity,
          status: 'PENDING',
          unitPriceSnapshot: dish.price,
        }
      })

      const addedTotal = newItems.reduce((total, item) => total + item.unitPriceSnapshot * item.quantity, 0)
      if (!Number.isSafeInteger(addedTotal)) throw invalidStoredPriceError()

      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          tableSessionId: tableSession._id,
          status: 'OPEN',
        },
        {
          $inc: { total: addedTotal },
          $push: { items: { $each: newItems } },
        },
        { new: true, session: transactionSession },
      ).select('_id status total')

      if (!updatedOrder) throw new Conflict('Order is no longer open.', 'ORDER_NOT_OPEN')
      if (!Number.isSafeInteger(updatedOrder.total) || updatedOrder.total < 0) {
        throw new Conflict('Order total is invalid.', 'ORDER_TOTAL_INVALID')
      }

      return {
        order: {
          id: updatedOrder._id.toString(),
          status: 'OPEN',
          total: updatedOrder.total,
        },
      }
    })
  } finally {
    await transactionSession.endSession()
  }
}
