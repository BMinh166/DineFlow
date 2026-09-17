export const ORDER_STATUSES = ['OPEN', 'PAYMENT_REQUESTED', 'CLOSED'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]
