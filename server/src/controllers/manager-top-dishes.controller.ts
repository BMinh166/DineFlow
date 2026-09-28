import type { RequestHandler } from 'express'

import { listManagerTopDishes } from '../services/manager-top-dishes.service.js'
import { successResponse } from '../utils/api-response.js'

export const listManagerTopDishesController: RequestHandler = async (_request, response) => {
  const topDishes = await listManagerTopDishes()
  response.status(200).json(successResponse({ topDishes }))
}
