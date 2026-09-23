export type KitchenItemStatus = 'PENDING' | 'PREPARING' | 'COMPLETED'

export interface KitchenQueueTicket {
  orderId: string
  tableNumber: number
  orderedAt: string
  itemId: string
  dishNameSnapshot: string
  quantity: number
  status: KitchenItemStatus
}

export interface KitchenItemTransitionResult {
  item: {
    id: string
    status: KitchenItemStatus
  }
}
