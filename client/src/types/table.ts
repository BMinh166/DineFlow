export type TableStatus = 'AVAILABLE' | 'OCCUPIED'

export interface ManagerTable {
  id: string
  number: number
  status: TableStatus
  active: boolean
  hasActiveSession: boolean
}
