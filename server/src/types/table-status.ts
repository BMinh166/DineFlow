export const TABLE_STATUSES = ['AVAILABLE', 'OCCUPIED'] as const

export type TableStatus = (typeof TABLE_STATUSES)[number]
