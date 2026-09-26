import { api } from './api'
import type { ManagedStaff } from '../types/staff'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getManagerStaff(): Promise<ManagedStaff[]> {
  const response = await api.get<ApiSuccessResponse<{ staff: ManagedStaff[] }>>('/manager/staff')
  return response.data.data.staff
}
