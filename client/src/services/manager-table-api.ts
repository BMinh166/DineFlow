import { api } from './api'
import type { ManagerTable } from '../types/table'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export type TableNumberInput = {
  number: number
}

export async function getManagerTables(): Promise<ManagerTable[]> {
  const response = await api.get<ApiSuccessResponse<{ tables: ManagerTable[] }>>('/manager/tables')
  return response.data.data.tables
}

export async function createManagerTable(input: TableNumberInput): Promise<ManagerTable> {
  const response = await api.post<ApiSuccessResponse<{ table: ManagerTable }>>('/manager/tables', input)
  return response.data.data.table
}

export async function updateManagerTable(tableId: string, input: TableNumberInput): Promise<ManagerTable> {
  const response = await api.patch<ApiSuccessResponse<{ table: ManagerTable }>>(`/manager/tables/${tableId}`, input)
  return response.data.data.table
}

export async function activateManagerTable(tableId: string): Promise<ManagerTable> {
  const response = await api.patch<ApiSuccessResponse<{ table: ManagerTable }>>(`/manager/tables/${tableId}/activate`)
  return response.data.data.table
}

export async function deactivateManagerTable(tableId: string): Promise<ManagerTable> {
  const response = await api.patch<ApiSuccessResponse<{ table: ManagerTable }>>(`/manager/tables/${tableId}/deactivate`)
  return response.data.data.table
}
