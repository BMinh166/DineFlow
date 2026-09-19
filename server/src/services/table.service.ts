import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import type { TableStatus } from '../types/table-status.js'
import { Conflict, NotFound } from '../utils/app-error.js'
import type { CreateTableRequest, UpdateTableRequest } from '../validators/table.validator.js'

export interface ManagerTableDto {
  id: string
  number: number
  status: TableStatus
  active: boolean
  hasActiveSession: boolean
}

type TableForDto = {
  _id: { toString(): string }
  number: number
  status: TableStatus
  active: boolean
}

type PersistedTableForDto = TableForDto & {
  save(): Promise<unknown>
}

type ActiveSessionForDto = {
  tableId: { toString(): string }
}

function toManagerTableDto(table: TableForDto, activeSessionTableIds: Set<string>): ManagerTableDto {
  return {
    id: table._id.toString(),
    number: table.number,
    status: table.status,
    active: table.active,
    hasActiveSession: activeSessionTableIds.has(table._id.toString()),
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 11000
}

function duplicateTableNumberError(): Conflict {
  return new Conflict('Table number already exists.', 'TABLE_NUMBER_ALREADY_EXISTS')
}

async function findTableOrThrow(tableId: string): Promise<PersistedTableForDto> {
  const table = await Table.findById(tableId).select('_id number status active')

  if (!table) {
    throw new NotFound('Table not found.', 'TABLE_NOT_FOUND')
  }

  return table
}

async function hasActiveTableSession(tableId: { toString(): string }): Promise<boolean> {
  return Boolean(await TableSession.exists({ tableId, status: 'ACTIVE' }))
}

async function toManagerTableDtoWithCurrentSession(table: TableForDto): Promise<ManagerTableDto> {
  const hasActiveSession = await hasActiveTableSession(table._id)
  return toManagerTableDto(table, hasActiveSession ? new Set([table._id.toString()]) : new Set())
}

export async function listManagerTables(): Promise<ManagerTableDto[]> {
  const tables = await Table.find()
    .select('_id number status active')
    .sort({ number: 1, _id: 1 })

  if (tables.length === 0) return []

  const activeSessions = await TableSession.find({
    tableId: { $in: tables.map(table => table._id) },
    status: 'ACTIVE',
  }).select('tableId')
  const activeSessionTableIds = new Set(
    activeSessions.map((session: ActiveSessionForDto) => session.tableId.toString()),
  )

  return tables.map(table => toManagerTableDto(table, activeSessionTableIds))
}

export async function createManagerTable({ number }: CreateTableRequest): Promise<ManagerTableDto> {
  const existingTable = await Table.exists({ number })

  if (existingTable) {
    throw duplicateTableNumberError()
  }

  const table = new Table({ number })

  try {
    await table.save()
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw duplicateTableNumberError()
    }

    throw error
  }

  return toManagerTableDto(table, new Set())
}

export async function updateManagerTable(tableId: string, { number }: UpdateTableRequest): Promise<ManagerTableDto> {
  const table = await findTableOrThrow(tableId)

  if (table.number !== number) {
    const existingTable = await Table.exists({ number, _id: { $ne: table._id } })

    if (existingTable) {
      throw duplicateTableNumberError()
    }

    table.number = number
  }

  try {
    await table.save()
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw duplicateTableNumberError()
    }

    throw error
  }

  return toManagerTableDtoWithCurrentSession(table)
}

export async function activateManagerTable(tableId: string): Promise<ManagerTableDto> {
  const table = await findTableOrThrow(tableId)
  table.active = true
  await table.save()

  return toManagerTableDtoWithCurrentSession(table)
}

export async function deactivateManagerTable(tableId: string): Promise<ManagerTableDto> {
  const table = await findTableOrThrow(tableId)
  const hasActiveSession = await hasActiveTableSession(table._id)

  if (table.status === 'OCCUPIED') {
    throw new Conflict('Occupied tables cannot be deactivated.', 'TABLE_OCCUPIED')
  }

  if (hasActiveSession) {
    throw new Conflict('Tables with an active session cannot be deactivated.', 'TABLE_HAS_ACTIVE_SESSION')
  }

  table.active = false
  await table.save()

  return toManagerTableDto(table, new Set())
}
