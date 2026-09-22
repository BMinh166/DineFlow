import jwt from 'jsonwebtoken'

import { getCustomerSessionJwtConfig } from '../config/env.js'
import type { CustomerSessionJwtPayload } from '../types/customer-session-jwt-payload.js'

export class InvalidCustomerSessionTokenError extends Error {
  constructor() {
    super('Invalid or expired customer session token.')
    this.name = 'InvalidCustomerSessionTokenError'
  }
}

function assertPayload(payload: CustomerSessionJwtPayload): void {
  if (!payload.tableId.trim() || !payload.tableSessionId.trim()) {
    throw new InvalidCustomerSessionTokenError()
  }
}

export function signCustomerSessionToken(payload: CustomerSessionJwtPayload): string {
  assertPayload(payload)

  const { secret, expiresInSeconds } = getCustomerSessionJwtConfig()
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: expiresInSeconds,
  })
}

export function verifyCustomerSessionToken(token: string): CustomerSessionJwtPayload {
  try {
    const { secret } = getCustomerSessionJwtConfig()
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] })

    if (
      typeof payload === 'string' ||
      typeof payload.tableId !== 'string' ||
      typeof payload.tableSessionId !== 'string'
    ) {
      throw new InvalidCustomerSessionTokenError()
    }

    const customerSession = {
      tableId: payload.tableId,
      tableSessionId: payload.tableSessionId,
    }
    assertPayload(customerSession)
    return customerSession
  } catch (error) {
    if (error instanceof InvalidCustomerSessionTokenError) throw error
    throw new InvalidCustomerSessionTokenError()
  }
}
