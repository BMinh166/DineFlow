import { api } from './api'
import type { WaiterTable } from '../types/table'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getWaiterTables(): Promise<WaiterTable[]> {
  const response = await api.get<ApiSuccessResponse<{ tables: WaiterTable[] }>>('/waiter/tables')
  return response.data.data.tables
}
