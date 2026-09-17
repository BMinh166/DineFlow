import jwt from 'jsonwebtoken'

import { getJwtConfig } from '../config/env.js'
import { STAFF_ROLES, type StaffRole } from '../types/staff-role.js'
import type { StaffJwtPayload } from '../types/staff-jwt-payload.js'

const invalidTokenMessage = 'Invalid or expired staff token.'

export class InvalidStaffTokenError extends Error {
  constructor() {
    super(invalidTokenMessage)
    this.name = 'InvalidStaffTokenError'
  }
}

function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === 'string' && STAFF_ROLES.includes(value as StaffRole)
}

function assertPayload(payload: StaffJwtPayload): void {
  if (!payload.userId.trim() || !isStaffRole(payload.role)) {
    throw new InvalidStaffTokenError()
  }
}

export function signStaffToken(payload: StaffJwtPayload): string {
  assertPayload(payload)

  const { secret, expiresInSeconds } = getJwtConfig()

  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: expiresInSeconds,
  })
}

export function verifyStaffToken(token: string): StaffJwtPayload {
  try {
    const { secret } = getJwtConfig()
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] })

    if (
      typeof payload === 'string' ||
      typeof payload.userId !== 'string' ||
      !payload.userId.trim() ||
      !isStaffRole(payload.role)
    ) {
      throw new InvalidStaffTokenError()
    }

    return { userId: payload.userId, role: payload.role }
  } catch (error) {
    if (error instanceof InvalidStaffTokenError) {
      throw error
    }

    throw new InvalidStaffTokenError()
  }
}
