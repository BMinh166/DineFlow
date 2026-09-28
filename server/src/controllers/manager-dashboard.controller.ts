import type { RequestHandler } from 'express'

import { getManagerDashboard } from '../services/manager-dashboard.service.js'
import { successResponse } from '../utils/api-response.js'

export const getManagerDashboardController: RequestHandler = async (_request, response) => {
  const dashboard = await getManagerDashboard()
  response.status(200).json(successResponse(dashboard))
}
