const staffTokenStorageKey = 'dineflow.staff-access-token'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getStaffToken(): string | null {
  try {
    return getStorage()?.getItem(staffTokenStorageKey) ?? null
  } catch {
    return null
  }
}

export function setStaffToken(token: string): void {
  try {
    getStorage()?.setItem(staffTokenStorageKey, token)
  } catch {
    // Storage failure is handled by the in-memory auth state.
  }
}

export function clearStaffToken(): void {
  try {
    getStorage()?.removeItem(staffTokenStorageKey)
  } catch {
    // Storage failure must not prevent in-memory session clearing.
  }
}
