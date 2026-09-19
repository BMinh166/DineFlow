import type { RequestHandler } from 'express'

import { listPublicMenuCategories, listPublicMenuDishes } from '../services/public-menu.service.js'
import { successResponse } from '../utils/api-response.js'

export const listPublicMenuCategoriesController: RequestHandler = async (_request, response) => {
  const categories = await listPublicMenuCategories()
  response.status(200).json(successResponse({ categories }))
}

export const listPublicMenuDishesController: RequestHandler = async (_request, response) => {
  const dishes = await listPublicMenuDishes()
  response.status(200).json(successResponse({ dishes }))
}
