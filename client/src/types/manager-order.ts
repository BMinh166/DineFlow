export type ManagerCurrentOrderStatus = 'OPEN' | 'PAYMENT_REQUESTED'

export interface ManagerCurrentOrder {
  id: string
  status: ManagerCurrentOrderStatus
  createdAt: string
  itemCount: number
  total: number
  table: {
    id: string
    number: number
  }
}

export type ManagerCurrentOrderItemStatus = 'PENDING' | 'PREPARING' | 'COMPLETED'

export interface ManagerCurrentOrderDetail {
  id: string
  status: ManagerCurrentOrderStatus
  createdAt: string
  total: number
  table: {
    id: string
    number: number
  }
  tableSession: {
    id: string
    status: 'ACTIVE'
  }
  items: Array<{
    id: string
    dishNameSnapshot: string
    unitPriceSnapshot: number
    quantity: number
    status: ManagerCurrentOrderItemStatus
  }>
}
