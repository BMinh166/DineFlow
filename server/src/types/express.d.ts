import type { AuthContext } from './auth-context.js'
import type { CustomerSessionContext } from './customer-session-context.js'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthContext
    customerSession?: CustomerSessionContext
  }
}

export {}
