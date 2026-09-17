import type { ReactNode } from 'react'

import { useStaffAuth } from '../../hooks/useStaffAuth'
import type { StaffRole } from '../../types/staff-auth'
import { ForbiddenPage } from '../../pages/ForbiddenPage'

export function RoleRoute({ allowedRoles, children }: { allowedRoles: StaffRole[]; children: ReactNode }) {
  const { user } = useStaffAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <ForbiddenPage />
  }

  return <>{children}</>
}
