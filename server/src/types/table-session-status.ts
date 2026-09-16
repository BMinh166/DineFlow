export const TABLE_SESSION_STATUSES = ['ACTIVE', 'CLOSED'] as const

export type TableSessionStatus = (typeof TABLE_SESSION_STATUSES)[number]
