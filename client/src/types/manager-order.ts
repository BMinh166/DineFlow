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
