import { useContext } from 'react'

import { CustomerSessionContext } from '../context/CustomerSessionContext'

export function useCustomerSession() {
  const context = useContext(CustomerSessionContext)

  if (!context) {
    throw new Error('useCustomerSession must be used within CustomerSessionProvider.')
  }

  return context
}
