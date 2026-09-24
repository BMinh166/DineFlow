export type TableStatus = 'AVAILABLE' | 'OCCUPIED'

export interface ManagerTable {
  id: string
  number: number
  status: TableStatus
  active: boolean
  hasActiveSession: boolean
}

export type WaiterTableOrderStatus = 'OPEN' | 'PAYMENT_REQUESTED' | 'CLOSED'
export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'COMPLETED'

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
    openedAt: string
    openedBy: {
      id: string
      name: string
    }
  }
  order: {
    id: string
    status: WaiterTableOrderStatus
    total: number
    itemCount: number
    items: Array<{
      id: string
      dishNameSnapshot: string
      unitPriceSnapshot: number
      quantity: number
      status: OrderItemStatus
    }>
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
