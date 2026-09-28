import { api } from './api'
import type { ManagerDashboard } from '../types/manager-dashboard'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getManagerDashboard(signal?: AbortSignal): Promise<ManagerDashboard> {
  const response = await api.get<ApiSuccessResponse<ManagerDashboard>>('/manager/dashboard', { signal })
  return response.data.data
}
