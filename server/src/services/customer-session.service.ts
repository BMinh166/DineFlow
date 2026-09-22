import { Table } from '../models/table.js'
import { TableSession } from '../models/table-session.js'
import { Conflict, NotFound, TooManyRequests, Unauthorized } from '../utils/app-error.js'
import { signCustomerSessionToken } from '../utils/customer-session-jwt.js'
import type { CustomerJoinRequest } from '../validators/customer-session.validator.js'

const failedJoinThreshold = 5
const joinCooldownMs = 60_000

type JoinAttemptRecord = {
  cooldownUntil?: number
  failedAttempts: number
}

const joinAttemptsByTableId = new Map<string, JoinAttemptRecord>()

function joinCooldownError(): TooManyRequests {
  return new TooManyRequests('Too many join attempts. Please try again later.', 'JOIN_COOLDOWN')
}

export function assertCustomerJoinNotCoolingDown(tableId: string): void {
  const record = joinAttemptsByTableId.get(tableId)
  if (!record?.cooldownUntil) return

  if (record.cooldownUntil > Date.now()) {
    throw joinCooldownError()
  }

  joinAttemptsByTableId.delete(tableId)
}

function recordFailedJoinAttempt(tableId: string): void {
  const record = joinAttemptsByTableId.get(tableId) ?? { failedAttempts: 0 }
  const failedAttempts = record.failedAttempts + 1

  if (failedAttempts >= failedJoinThreshold) {
    joinAttemptsByTableId.set(tableId, {
      failedAttempts,
      cooldownUntil: Date.now() + joinCooldownMs,
    })
    throw joinCooldownError()
  }

  joinAttemptsByTableId.set(tableId, { failedAttempts })
  throw new Unauthorized('Invalid join code.', 'INVALID_JOIN_CODE')
}

export interface CustomerJoinResult {
  session: {
    tableId: string
    tableSessionId: string
  }
  sessionToken: string
}

export async function joinCustomerTable(
  tableId: string,
  { joinCode }: CustomerJoinRequest,
): Promise<CustomerJoinResult> {
  assertCustomerJoinNotCoolingDown(tableId)

  const table = await Table.findById(tableId).select('_id active status')
  if (!table) {
    throw new NotFound('Table not found.', 'TABLE_NOT_FOUND')
  }

  if (!table.active) {
    throw new NotFound('Table is inactive.', 'TABLE_INACTIVE')
  }

  if (table.status !== 'OCCUPIED') {
    throw new Conflict('Table is not occupied.', 'TABLE_NOT_OCCUPIED')
  }

  const tableSession = await TableSession.findOne({ tableId: table._id, status: 'ACTIVE' })
    .select('_id tableId joinCode status')
  if (!tableSession) {
    throw new Conflict('Active table session not found.', 'ACTIVE_TABLE_SESSION_NOT_FOUND')
  }

  if (tableSession.joinCode !== joinCode) {
    recordFailedJoinAttempt(tableId)
  }

  joinAttemptsByTableId.delete(tableId)
  const trustedSession = {
    tableId: table._id.toString(),
    tableSessionId: tableSession._id.toString(),
  }

  return {
    session: trustedSession,
    sessionToken: signCustomerSessionToken(trustedSession),
  }
}
