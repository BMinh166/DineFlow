export const ORDER_ITEM_STATUSES = ['PENDING', 'PREPARING', 'COMPLETED'] as const

export type OrderItemStatus = (typeof ORDER_ITEM_STATUSES)[number]
