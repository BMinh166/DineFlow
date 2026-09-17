import type { StaffRole } from './staff-role.js'

export interface StaffJwtPayload {
  userId: string
  role: StaffRole
}
