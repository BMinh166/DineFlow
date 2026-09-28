import type { ManagerCurrentOrder, ManagerCurrentOrderDetail } from '../types/manager-order'
import { api } from './api'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getManagerCurrentOrders(): Promise<ManagerCurrentOrder[]> {
  const response = await api.get<ApiSuccessResponse<{ orders: ManagerCurrentOrder[] }>>('/manager/orders')
  return response.data.data.orders
}

export async function getManagerCurrentOrder(orderId: string): Promise<ManagerCurrentOrderDetail> {
  const response = await api.get<ApiSuccessResponse<{ order: ManagerCurrentOrderDetail }>>(`/manager/orders/${orderId}`)
  return response.data.data.order
}
