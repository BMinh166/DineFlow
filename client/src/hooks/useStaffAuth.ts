import { useContext } from 'react'

import { StaffAuthContext } from '../context/StaffAuthContext'

export function useStaffAuth() {
  const context = useContext(StaffAuthContext)

  if (!context) {
    throw new Error('useStaffAuth must be used within StaffAuthProvider.')
  }

  return context
}
