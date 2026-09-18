import type { RequestHandler } from 'express'
import { createManagerDish, listManagerDishes, setManagerDishActive, setManagerDishAvailable, updateManagerDish } from '../services/dish.service.js'
import { successResponse } from '../utils/api-response.js'
import type { CreateDishRequest, UpdateDishRequest } from '../validators/dish.validator.js'

function getValidatedDishId(params: { dishId?: string | string[] }): string {
  return params.dishId as string
}

export const listManagerDishesController: RequestHandler = async (_request, response) => {
  const dishes = await listManagerDishes()
  response.status(200).json(successResponse({ dishes }))
}

export const createManagerDishController: RequestHandler = async (request, response) => {
  const dish = await createManagerDish(request.body as CreateDishRequest)
  response.status(201).json(successResponse({ dish }))
}

export const updateManagerDishController: RequestHandler = async (request, response) => {
  const dish = await updateManagerDish(getValidatedDishId(request.params), request.body as UpdateDishRequest)
  response.status(200).json(successResponse({ dish }))
}

export const activateManagerDishController: RequestHandler = async (request, response) => {
  const dish = await setManagerDishActive(getValidatedDishId(request.params), true)
  response.status(200).json(successResponse({ dish }))
}

export const deactivateManagerDishController: RequestHandler = async (request, response) => {
  const dish = await setManagerDishActive(getValidatedDishId(request.params), false)
  response.status(200).json(successResponse({ dish }))
}

export const markManagerDishAvailableController: RequestHandler = async (request, response) => {
  const dish = await setManagerDishAvailable(getValidatedDishId(request.params), true)
  response.status(200).json(successResponse({ dish }))
}

export const markManagerDishUnavailableController: RequestHandler = async (request, response) => {
  const dish = await setManagerDishAvailable(getValidatedDishId(request.params), false)
  response.status(200).json(successResponse({ dish }))
}
