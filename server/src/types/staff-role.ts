export const STAFF_ROLES = ['WAITER', 'KITCHEN', 'MANAGER'] as const

export type StaffRole = (typeof STAFF_ROLES)[number]
