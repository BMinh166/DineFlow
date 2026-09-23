import type { RequestHandler } from 'express'

import {
  markKitchenItemCompleted,
  startPreparingKitchenItem,
} from '../services/kitchen-item-transition.service.js'
import { successResponse } from '../utils/api-response.js'

function getValidatedItemId(params: { itemId?: string | string[] }): string {
  return params.itemId as string
}

export const startPreparingKitchenItemController: RequestHandler = async (request, response) => {
  const result = await startPreparingKitchenItem(getValidatedItemId(request.params))
  response.status(200).json(successResponse(result))
}

export const markKitchenItemCompletedController: RequestHandler = async (request, response) => {
  const result = await markKitchenItemCompleted(getValidatedItemId(request.params))
  response.status(200).json(successResponse(result))
}
