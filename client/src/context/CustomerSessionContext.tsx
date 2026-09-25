import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { getCurrentCustomerSession, joinCustomerTable } from '../services/customer-session-api'
import {
  clearCustomerSessionToken,
  getCustomerSessionToken,
  setCustomerSessionToken,
} from '../services/customer-session-token-storage'
import { isCustomerUnauthorizedError, subscribeToCustomerUnauthorized } from '../services/customer-api'
import type { CustomerSession, CustomerSessionStatus } from '../types/customer-session'

interface CustomerSessionContextValue {
  sessionExpired: boolean
  status: CustomerSessionStatus
  session: CustomerSession | null
  isAuthorizedForTable: (tableId: string) => boolean
  join: (tableId: string, joinCode: number) => Promise<void>
  clearSession: () => void
}

export const CustomerSessionContext = createContext<CustomerSessionContextValue | undefined>(undefined)

export function CustomerSessionProvider({ children }: { children: ReactNode }) {
  const [sessionExpired, setSessionExpired] = useState(false)
  const [status, setStatus] = useState<CustomerSessionStatus>('restoring')
  const [session, setSession] = useState<CustomerSession | null>(null)

  const clearSession = useCallback(() => {
    clearCustomerSessionToken()
    setSessionExpired(true)
    setSession(null)
    setStatus('unauthorized')
  }, [])

  useEffect(() => subscribeToCustomerUnauthorized(clearSession), [clearSession])

  useEffect(() => {
    if (!getCustomerSessionToken()) {
      setStatus('unauthorized')
      return
    }

    let active = true

    void getCurrentCustomerSession()
      .then(restoredSession => {
        if (!active) return
        setSession(restoredSession)
        setStatus('authorized')
      })
      .catch(error => {
        if (!active) return
        if (isCustomerUnauthorizedError(error)) clearSession()
        setSession(null)
        setStatus('unauthorized')
      })

    return () => {
      active = false
    }
  }, [clearSession])

  const join = useCallback(async (tableId: string, joinCode: number) => {
    const result = await joinCustomerTable(tableId, joinCode)
    setCustomerSessionToken(result.sessionToken)
    setSessionExpired(false)
    setSession(result.session)
    setStatus('authorized')
  }, [])

  const isAuthorizedForTable = useCallback(
    (tableId: string) => status === 'authorized' && session?.tableId === tableId,
    [session, status],
  )

  const value = useMemo<CustomerSessionContextValue>(() => ({
    sessionExpired,
    status,
    session,
    isAuthorizedForTable,
    join,
    clearSession,
  }), [clearSession, isAuthorizedForTable, join, session, sessionExpired, status])

  return <CustomerSessionContext.Provider value={value}>{children}</CustomerSessionContext.Provider>
}
