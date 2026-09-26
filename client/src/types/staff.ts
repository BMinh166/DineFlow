export type StaffRole = 'WAITER' | 'KITCHEN' | 'MANAGER'

export interface ManagedStaff {
  id: string
  name: string
  username: string
  email: string
  role: StaffRole
  active: boolean
  createdAt: string
  updatedAt: string
}
