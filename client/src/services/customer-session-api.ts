import axios from 'axios'

import { api } from './api'
import { customerApi } from './customer-api'
import type { CustomerJoinErrorKind, CustomerSession } from '../types/customer-session'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

interface ApiErrorResponse {
  code?: unknown
  success?: unknown
}

export interface CustomerJoinResult {
  session: CustomerSession
  sessionToken: string
}

export async function joinCustomerTable(tableId: string, joinCode: number): Promise<CustomerJoinResult> {
  const response = await api.post<ApiSuccessResponse<CustomerJoinResult>>(
    `/public/tables/${tableId}/join`,
    { joinCode },
  )

  return response.data.data
}

export async function getCurrentCustomerSession(): Promise<CustomerSession> {
  const response = await customerApi.get<ApiSuccessResponse<{ session: CustomerSession }>>('/customer/session')
  return response.data.data.session
}

export function getCustomerJoinErrorKind(error: unknown): CustomerJoinErrorKind {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return 'unexpected'

  const code = error.response?.data?.code
  if (code === 'INVALID_JOIN_CODE') return 'invalid-code'
  if (error.response?.status === 429 || code === 'JOIN_COOLDOWN') return 'cooldown'
  if (
    code === 'TABLE_INACTIVE'
    || code === 'TABLE_NOT_FOUND'
    || code === 'TABLE_NOT_OCCUPIED'
    || code === 'ACTIVE_TABLE_SESSION_NOT_FOUND'
  ) return 'unavailable'

  return 'unexpected'
}
