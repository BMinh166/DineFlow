import type { RequestHandler } from 'express'

import { createManagerStaff, listManagerStaff } from '../services/staff.service.js'
import { successResponse } from '../utils/api-response.js'
import type { CreateStaffRequest } from '../validators/staff.validator.js'

export const listManagerStaffController: RequestHandler = async (_request, response) => {
  const staff = await listManagerStaff()
  response.status(200).json(successResponse({ staff }))
}

export const createManagerStaffController: RequestHandler = async (request, response) => {
  const staff = await createManagerStaff(request.body as CreateStaffRequest)
  response.status(201).json(successResponse({ staff }))
}
