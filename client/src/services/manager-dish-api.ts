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

export type DishInput = {
  categoryId: string
  name: string
  description?: string
  imageUrl?: string
  price: number
}

export async function createManagerDish(input: DishInput): Promise<Dish> {
  const response = await api.post<ApiSuccessResponse<{ dish: Dish }>>('/manager/dishes', input)
  return response.data.data.dish
}

export async function updateManagerDish(dishId: string, input: DishInput): Promise<Dish> {
  const response = await api.patch<ApiSuccessResponse<{ dish: Dish }>>(`/manager/dishes/${dishId}`, input)
  return response.data.data.dish
}

export async function activateManagerDish(dishId: string): Promise<Dish> {
  const response = await api.patch<ApiSuccessResponse<{ dish: Dish }>>(`/manager/dishes/${dishId}/activate`)
  return response.data.data.dish
}

export async function deactivateManagerDish(dishId: string): Promise<Dish> {
  const response = await api.patch<ApiSuccessResponse<{ dish: Dish }>>(`/manager/dishes/${dishId}/deactivate`)
  return response.data.data.dish
}

export async function markManagerDishAvailable(dishId: string): Promise<Dish> {
  const response = await api.patch<ApiSuccessResponse<{ dish: Dish }>>(`/manager/dishes/${dishId}/available`)
  return response.data.data.dish
}

export async function markManagerDishUnavailable(dishId: string): Promise<Dish> {
  const response = await api.patch<ApiSuccessResponse<{ dish: Dish }>>(`/manager/dishes/${dishId}/unavailable`)
  return response.data.data.dish
}
