export interface CustomerSession {
  tableId: string
  tableSessionId: string
}

export type CustomerSessionStatus = 'restoring' | 'authorized' | 'unauthorized'

export type CustomerJoinErrorKind = 'invalid-code' | 'cooldown' | 'unavailable' | 'unexpected'
