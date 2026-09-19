import { api } from './api'
import type { PublicCategory, PublicDish, PublicTable } from '../types/public-menu'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getPublicTable(tableId: string): Promise<PublicTable> {
  const response = await api.get<ApiSuccessResponse<{ table: PublicTable }>>(`/public/tables/${tableId}`)
  return response.data.data.table
}

export async function getPublicMenuCategories(): Promise<PublicCategory[]> {
  const response = await api.get<ApiSuccessResponse<{ categories: PublicCategory[] }>>('/public/menu/categories')
  return response.data.data.categories
}

export async function getPublicMenuDishes(): Promise<PublicDish[]> {
  const response = await api.get<ApiSuccessResponse<{ dishes: PublicDish[] }>>('/public/menu/dishes')
  return response.data.data.dishes
}
