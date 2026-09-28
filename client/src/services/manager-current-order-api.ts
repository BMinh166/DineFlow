import type { ManagerCurrentOrder } from '../types/manager-order'
import { api } from './api'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getManagerCurrentOrders(): Promise<ManagerCurrentOrder[]> {
  const response = await api.get<ApiSuccessResponse<{ orders: ManagerCurrentOrder[] }>>('/manager/orders')
  return response.data.data.orders
}
