import type { RequestHandler } from 'express'

import { listKitchenQueue } from '../services/kitchen-queue.service.js'
import { successResponse } from '../utils/api-response.js'

export const listKitchenQueueController: RequestHandler = async (_request, response) => {
  const tickets = await listKitchenQueue()
  response.status(200).json(successResponse({ tickets }))
}
