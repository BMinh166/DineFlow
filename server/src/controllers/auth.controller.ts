import type { RequestHandler } from 'express'

import { successResponse } from '../utils/api-response.js'
import { getCurrentStaff, loginStaff } from '../services/auth.service.js'
import type { StaffLoginRequest } from '../validators/auth.validator.js'

export const loginStaffController: RequestHandler = async (request, response) => {
  const result = await loginStaff(request.body as StaffLoginRequest)

  response.status(200).json(successResponse(result))
}

export const getCurrentStaffController: RequestHandler = async (request, response) => {
  const user = await getCurrentStaff(request.auth)

  response.status(200).json(successResponse({ user }))
}
