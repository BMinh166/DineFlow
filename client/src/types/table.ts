export type TableStatus = 'AVAILABLE' | 'OCCUPIED'

export interface ManagerTable {
  id: string
  number: number
  status: TableStatus
  active: boolean
  hasActiveSession: boolean
}

export type WaiterTableOrderStatus = 'OPEN' | 'PAYMENT_REQUESTED' | 'CLOSED'

export interface WaiterTable {
  id: string
  number: number
  status: TableStatus
  active: boolean
  hasActiveSession: boolean
  orderStatus: WaiterTableOrderStatus | null
}
