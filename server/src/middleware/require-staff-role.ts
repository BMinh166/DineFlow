import type { RequestHandler } from 'express'

import type { StaffRole } from '../types/staff-role.js'
import { Forbidden, Unauthorized } from '../utils/app-error.js'

const authenticationFailureCode = 'AUTHENTICATION_FAILED'
const authorizationFailureCode = 'INSUFFICIENT_ROLE'

export function requireStaffRole(...allowedRoles: StaffRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth) {
      next(new Unauthorized('Unauthorized.', authenticationFailureCode))
      return
    }

    if (!allowedRoles.includes(request.auth.role)) {
      next(new Forbidden('Forbidden.', authorizationFailureCode))
      return
    }

    next()
  }
}
