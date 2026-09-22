const customerSessionTokenStorageKey = 'dineflow.customer-session-token'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getCustomerSessionToken(): string | null {
  try {
    return getStorage()?.getItem(customerSessionTokenStorageKey) ?? null
  } catch {
    return null
  }
}

export function setCustomerSessionToken(token: string): void {
  try {
    getStorage()?.setItem(customerSessionTokenStorageKey, token)
  } catch {
    // Storage failure is handled by the in-memory customer session state.
  }
}

export function clearCustomerSessionToken(): void {
  try {
    getStorage()?.removeItem(customerSessionTokenStorageKey)
  } catch {
    // Storage failure must not prevent in-memory session clearing.
  }
}
