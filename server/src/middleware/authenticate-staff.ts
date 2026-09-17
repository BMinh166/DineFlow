import { Types } from 'mongoose'
import type { RequestHandler } from 'express'

import { User } from '../models/user.js'
import { STAFF_ROLES, type StaffRole } from '../types/staff-role.js'
import { Unauthorized } from '../utils/app-error.js'
import { verifyStaffToken } from '../utils/staff-jwt.js'

const authenticationFailureCode = 'AUTHENTICATION_FAILED'

function authenticationFailure(): Unauthorized {
  return new Unauthorized('Unauthorized.', authenticationFailureCode)
}

function extractBearerToken(authorization: string | undefined): string | null {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i)

  return match?.[1] ?? null
}

function isStaffRole(role: unknown): role is StaffRole {
  return typeof role === 'string' && STAFF_ROLES.includes(role as StaffRole)
}

export const authenticateStaff: RequestHandler = async (request, _response, next) => {
  const token = extractBearerToken(request.get('authorization'))

  if (!token) {
    next(authenticationFailure())
    return
  }

  let payload: ReturnType<typeof verifyStaffToken>
  try {
    payload = verifyStaffToken(token)
  } catch {
    next(authenticationFailure())
    return
  }

  if (!Types.ObjectId.isValid(payload.userId)) {
    next(authenticationFailure())
    return
  }

  const user = await User.findById(payload.userId).select('_id role active')

  if (!user || !user.active || !isStaffRole(user.role) || user.role !== payload.role) {
    next(authenticationFailure())
    return
  }

  request.auth = {
    userId: user._id.toString(),
    role: user.role,
  }
  next()
}
