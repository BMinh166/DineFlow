import { api } from './api'
import type { Category } from '../types/category'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getManagerCategories(): Promise<Category[]> {
  const response = await api.get<ApiSuccessResponse<{ categories: Category[] }>>('/manager/categories')
  return response.data.data.categories
}
