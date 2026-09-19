import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import type { TableStatus } from '../types/table-status.js'
import { Conflict } from '../utils/app-error.js'
import type { CreateTableRequest } from '../validators/table.validator.js'

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
