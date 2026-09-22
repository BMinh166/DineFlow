import { Types } from 'mongoose'
import type { RequestHandler } from 'express'

import { TableSession } from '../models/table-session.js'
import { Unauthorized } from '../utils/app-error.js'
import { verifyCustomerSessionToken } from '../utils/customer-session-jwt.js'

const authenticationFailureCode = 'CUSTOMER_SESSION_AUTHENTICATION_FAILED'
const inactiveSessionCode = 'CUSTOMER_SESSION_INACTIVE'
const tableMismatchCode = 'CUSTOMER_SESSION_TABLE_MISMATCH'

function extractBearerToken(authorization: string | undefined): string | null {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i)
  return match?.[1] ?? null
}

function authenticationFailure(): Unauthorized {
  return new Unauthorized('Customer session is invalid.', authenticationFailureCode)
}

export const authenticateCustomerSession: RequestHandler = async (request, _response, next) => {
  const token = extractBearerToken(request.get('authorization'))

  if (!token) {
    next(authenticationFailure())
    return
  }

  let payload: ReturnType<typeof verifyCustomerSessionToken>
  try {
    payload = verifyCustomerSessionToken(token)
  } catch {
    next(authenticationFailure())
    return
  }

  if (!Types.ObjectId.isValid(payload.tableId) || !Types.ObjectId.isValid(payload.tableSessionId)) {
    next(authenticationFailure())
    return
  }

  const tableSession = await TableSession.findById(payload.tableSessionId)
    .select('_id tableId status')

  if (!tableSession || tableSession.status !== 'ACTIVE') {
    next(new Unauthorized('Customer session is no longer active.', inactiveSessionCode))
    return
  }

  if (tableSession.tableId.toString() !== payload.tableId) {
    next(new Unauthorized('Customer session does not match this table.', tableMismatchCode))
    return
  }

  request.customerSession = {
    tableId: payload.tableId,
    tableSessionId: payload.tableSessionId,
  }
  next()
}
