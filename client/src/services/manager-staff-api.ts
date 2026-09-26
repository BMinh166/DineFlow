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

export type CreateStaffInput = {
  name: string
  username: string
  email: string
  password: string
  role: ManagedStaff['role']
  active: boolean
}

export type UpdateStaffInput = {
  name?: string
  username?: string
  email?: string
  role?: ManagedStaff['role']
}

export async function createManagerStaff(input: CreateStaffInput): Promise<ManagedStaff> {
  const response = await api.post<ApiSuccessResponse<{ staff: ManagedStaff }>>('/manager/staff', input)
  return response.data.data.staff
}

export async function updateManagerStaff(staffId: string, input: UpdateStaffInput): Promise<ManagedStaff> {
  const response = await api.patch<ApiSuccessResponse<{ staff: ManagedStaff }>>(`/manager/staff/${staffId}`, input)
  return response.data.data.staff
}

export async function activateManagerStaff(staffId: string): Promise<ManagedStaff> {
  const response = await api.patch<ApiSuccessResponse<{ staff: ManagedStaff }>>(`/manager/staff/${staffId}/activate`)
  return response.data.data.staff
}

export async function deactivateManagerStaff(staffId: string): Promise<ManagedStaff> {
  const response = await api.patch<ApiSuccessResponse<{ staff: ManagedStaff }>>(`/manager/staff/${staffId}/deactivate`)
  return response.data.data.staff
}
