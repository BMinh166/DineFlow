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

export interface WaiterActiveTableSession {
  table: {
    id: string
    number: number
    status: TableStatus
    active: boolean
  }
  session: {
    id: string
    status: 'ACTIVE'
    joinCode: number
  }
}

export interface OpenWaiterTableResult {
  table: {
    id: string
    number: number
    status: TableStatus
  }
  session: {
    id: string
    status: 'ACTIVE'
    joinCode: number
  }
  order: {
    id: string
    status: 'OPEN'
  }
}
