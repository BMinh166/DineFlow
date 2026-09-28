import { api } from './api'
import type { ManagerHistoricalOrder, ManagerHistoryFilters, ManagerHistoryOrder } from '../types/manager-history'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getManagerHistory(filters: ManagerHistoryFilters = {}): Promise<ManagerHistoryOrder[]> {
  const params = new URLSearchParams()
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)

  const response = await api.get<ApiSuccessResponse<{ orders: ManagerHistoryOrder[] }>>('/manager/history', { params })
  return response.data.data.orders
}

export async function getManagerHistoricalOrder(orderId: string): Promise<ManagerHistoricalOrder> {
  const response = await api.get<ApiSuccessResponse<{ order: ManagerHistoricalOrder }>>(`/manager/history/${orderId}`)
  return response.data.data.order
}
