export const STAFF_ROLES = ['WAITER', 'KITCHEN', 'MANAGER'] as const

export type StaffRole = (typeof STAFF_ROLES)[number]

export interface StaffUser {
  id: string
  name: string
  username: string
  email: string
  role: StaffRole
}

export type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated' | 'restore-failed'
