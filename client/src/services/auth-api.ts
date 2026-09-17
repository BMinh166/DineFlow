import { api } from './api'
import type { StaffUser } from '../types/staff-auth'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

interface LoginResponseData {
  token: string
  user: StaffUser
}

export async function loginStaff(identifier: string, password: string): Promise<LoginResponseData> {
  const response = await api.post<ApiSuccessResponse<LoginResponseData>>(
    '/auth/login',
    { identifier, password },
    { skipAuthInvalidation: true },
  )

  return response.data.data
}

export async function getCurrentStaff(): Promise<StaffUser> {
  const response = await api.get<ApiSuccessResponse<{ user: StaffUser }>>('/auth/me')

  return response.data.data.user
}
