import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { getCurrentStaff, loginStaff } from '../services/auth-api'
import { isUnauthorizedError, subscribeToUnauthorized } from '../services/api'
import { clearStaffToken, getStaffToken, setStaffToken } from '../services/staff-token-storage'
import type { AuthStatus, StaffUser } from '../types/staff-auth'

interface StaffAuthContextValue {
  status: AuthStatus
  user: StaffUser | null
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
}

export const StaffAuthContext = createContext<StaffAuthContextValue | undefined>(undefined)

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('restoring')
  const [user, setUser] = useState<StaffUser | null>(null)

  const logout = useCallback(() => {
    clearStaffToken()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => subscribeToUnauthorized(logout), [logout])

  useEffect(() => {
    if (!getStaffToken()) {
      setStatus('unauthenticated')
      return
    }

    let active = true

    void getCurrentStaff()
      .then(currentUser => {
        if (!active) return
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(error => {
        if (!active) return
        if (isUnauthorizedError(error)) {
          clearStaffToken()
          setUser(null)
          setStatus('unauthenticated')
          return
        }

        setUser(null)
        setStatus('restore-failed')
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    const result = await loginStaff(identifier, password)
    setStaffToken(result.token)
    setUser(result.user)
    setStatus('authenticated')
  }, [])

  const value = useMemo<StaffAuthContextValue>(() => ({
    status,
    user,
    isAuthenticated: status === 'authenticated',
    login,
    logout,
  }), [login, logout, status, user])

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>
}
