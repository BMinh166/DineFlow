import { api } from './api'
import type { Dish } from '../types/dish'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getManagerDishes(): Promise<Dish[]> {
  const response = await api.get<ApiSuccessResponse<{ dishes: Dish[] }>>('/manager/dishes')
  return response.data.data.dishes
}
