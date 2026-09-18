import type { RequestHandler } from 'express'
import { successResponse } from '../utils/api-response.js'
import { createManagerCategory, listManagerCategories } from '../services/category.service.js'
import type { CreateCategoryRequest } from '../validators/category.validator.js'

export const listManagerCategoriesController: RequestHandler = async (_request, response) => {
  const categories = await listManagerCategories()
  response.status(200).json(successResponse({ categories }))
}

export const createManagerCategoryController: RequestHandler = async (request, response) => {
  const category = await createManagerCategory(request.body as CreateCategoryRequest)
  response.status(201).json(successResponse({ category }))
}
