import type { StaffRole } from '../types/staff-auth'

export function getStaffRoleHomePath(role: StaffRole): string {
  switch (role) {
    case 'WAITER':
      return '/waiter/tables'
    case 'KITCHEN':
      return '/kitchen'
    case 'MANAGER':
      return '/manager'
  }
}
