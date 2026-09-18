import type { RequestHandler } from 'express'
import { createManagerDish, listManagerDishes } from '../services/dish.service.js'
import { successResponse } from '../utils/api-response.js'
import type { CreateDishRequest } from '../validators/dish.validator.js'

export const listManagerDishesController: RequestHandler = async (_request, response) => {
  const dishes = await listManagerDishes()
  response.status(200).json(successResponse({ dishes }))
}

export const createManagerDishController: RequestHandler = async (request, response) => {
  const dish = await createManagerDish(request.body as CreateDishRequest)
  response.status(201).json(successResponse({ dish }))
}
