import type { RequestHandler } from 'express'

import { activateManagerStaff, createManagerStaff, deactivateManagerStaff, listManagerStaff, updateManagerStaff } from '../services/staff.service.js'
import { successResponse } from '../utils/api-response.js'
import type { CreateStaffRequest, UpdateStaffRequest } from '../validators/staff.validator.js'

function getValidatedStaffId(params: { staffId?: string | string[] }): string {
  return params.staffId as string
}

export const listManagerStaffController: RequestHandler = async (_request, response) => {
  const staff = await listManagerStaff()
  response.status(200).json(successResponse({ staff }))
}

export const createManagerStaffController: RequestHandler = async (request, response) => {
  const staff = await createManagerStaff(request.body as CreateStaffRequest)
  response.status(201).json(successResponse({ staff }))
}

export const updateManagerStaffController: RequestHandler = async (request, response) => {
  const staff = await updateManagerStaff(
    getValidatedStaffId(request.params),
    request.body as UpdateStaffRequest,
  )
  response.status(200).json(successResponse({ staff }))
}

export const activateManagerStaffController: RequestHandler = async (request, response) => {
  const staff = await activateManagerStaff(getValidatedStaffId(request.params))
  response.status(200).json(successResponse({ staff }))
}

export const deactivateManagerStaffController: RequestHandler = async (request, response) => {
  const staff = await deactivateManagerStaff(getValidatedStaffId(request.params))
  response.status(200).json(successResponse({ staff }))
}
