import type { RequestHandler } from 'express'
import { successResponse } from '../utils/api-response.js'
import { createManagerCategory, listManagerCategories, setManagerCategoryActive, updateManagerCategory } from '../services/category.service.js'
import type { CreateCategoryRequest, UpdateCategoryRequest } from '../validators/category.validator.js'

function getValidatedCategoryId(params: { categoryId?: string | string[] }): string {
  return params.categoryId as string
}

export const listManagerCategoriesController: RequestHandler = async (_request, response) => {
  const categories = await listManagerCategories()
  response.status(200).json(successResponse({ categories }))
}

export const createManagerCategoryController: RequestHandler = async (request, response) => {
  const category = await createManagerCategory(request.body as CreateCategoryRequest)
  response.status(201).json(successResponse({ category }))
}

export const updateManagerCategoryController: RequestHandler = async (request, response) => {
  const category = await updateManagerCategory(getValidatedCategoryId(request.params), request.body as UpdateCategoryRequest)
  response.status(200).json(successResponse({ category }))
}

export const activateManagerCategoryController: RequestHandler = async (request, response) => {
  const category = await setManagerCategoryActive(getValidatedCategoryId(request.params), true)
  response.status(200).json(successResponse({ category }))
}

export const deactivateManagerCategoryController: RequestHandler = async (request, response) => {
  const category = await setManagerCategoryActive(getValidatedCategoryId(request.params), false)
  response.status(200).json(successResponse({ category }))
}
