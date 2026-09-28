import { api } from './api'
import type { ManagerRevenueQuery, ManagerRevenueSummary } from '../types/manager-revenue'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getManagerRevenue(query: ManagerRevenueQuery, signal?: AbortSignal): Promise<ManagerRevenueSummary> {
  const params = new URLSearchParams({ period: query.period })
  if (query.period === 'CUSTOM_RANGE') {
    params.set('dateFrom', query.dateFrom)
    params.set('dateTo', query.dateTo)
  }

  const response = await api.get<ApiSuccessResponse<{ summary: ManagerRevenueSummary }>>('/manager/revenue', {
    params,
    signal,
  })
  return response.data.data.summary
}
