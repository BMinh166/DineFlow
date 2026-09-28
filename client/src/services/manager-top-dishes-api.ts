import { api } from './api'
import type { ManagerTopDish } from '../types/manager-top-dishes'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getManagerTopDishes(signal?: AbortSignal): Promise<ManagerTopDish[]> {
  const response = await api.get<ApiSuccessResponse<{ topDishes: ManagerTopDish[] }>>('/manager/top-dishes', { signal })
  return response.data.data.topDishes
}
