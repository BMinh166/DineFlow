import type { StaffRole } from './staff-role.js'

export interface AuthContext {
  userId: string
  role: StaffRole
}
