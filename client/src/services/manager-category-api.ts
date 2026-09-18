import { api } from './api'
import type { Category } from '../types/category'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export type CreateCategoryInput = {
  name: string
  description?: string
}

export type UpdateCategoryInput = {
  name: string
  description: string
}

export async function getManagerCategories(): Promise<Category[]> {
  const response = await api.get<ApiSuccessResponse<{ categories: Category[] }>>('/manager/categories')
  return response.data.data.categories
}

export async function createManagerCategory({ name, description }: CreateCategoryInput): Promise<Category> {
  const response = await api.post<ApiSuccessResponse<{ category: Category }>>('/manager/categories', {
    name,
    ...(description === undefined ? {} : { description }),
  })

  return response.data.data.category
}

export async function updateManagerCategory(categoryId: string, { name, description }: UpdateCategoryInput): Promise<Category> {
  const response = await api.patch<ApiSuccessResponse<{ category: Category }>>(`/manager/categories/${categoryId}`, {
    name,
    description,
  })

  return response.data.data.category
}

export async function activateManagerCategory(categoryId: string): Promise<Category> {
  const response = await api.patch<ApiSuccessResponse<{ category: Category }>>(`/manager/categories/${categoryId}/activate`)
  return response.data.data.category
}

export async function deactivateManagerCategory(categoryId: string): Promise<Category> {
  const response = await api.patch<ApiSuccessResponse<{ category: Category }>>(`/manager/categories/${categoryId}/deactivate`)
  return response.data.data.category
}
