import { api } from './api'
import type { OpenWaiterTableResult, WaiterActiveTableSession, WaiterTable } from '../types/table'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getWaiterTables(): Promise<WaiterTable[]> {
  const response = await api.get<ApiSuccessResponse<{ tables: WaiterTable[] }>>('/waiter/tables')
  return response.data.data.tables
}

export async function openWaiterTable(tableId: string): Promise<OpenWaiterTableResult> {
  const response = await api.post<ApiSuccessResponse<OpenWaiterTableResult>>(`/waiter/tables/${tableId}/open`)
  return response.data.data
}

export async function getWaiterActiveTableSession(
  tableId: string,
  signal?: AbortSignal,
): Promise<WaiterActiveTableSession> {
  const response = await api.get<ApiSuccessResponse<{ tableSession: WaiterActiveTableSession }>>(`/waiter/tables/${tableId}/session`, { signal })
  return response.data.data.tableSession
}
