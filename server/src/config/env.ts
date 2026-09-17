import dotenv from 'dotenv'

dotenv.config()

const defaultPort = 3000
const defaultClientOrigin = 'http://localhost:5173'
const configuredPort = Number(process.env.PORT)
const clientOrigin = process.env.CLIENT_ORIGIN?.trim() || defaultClientOrigin
const mongodbUri = process.env.MONGODB_URI?.trim()
const nodeEnv = process.env.NODE_ENV?.trim() || 'development'

export interface JwtConfig {
  secret: string
  expiresInSeconds: number
}

export function getJwtConfig(): JwtConfig {
  const secret = process.env.JWT_SECRET?.trim()
  const expiresIn = process.env.JWT_EXPIRES_IN?.trim()

  if (!secret) {
    throw new Error('JWT_SECRET must be configured.')
  }

  if (expiresIn !== '8h') {
    throw new Error('JWT_EXPIRES_IN must be configured as 8h.')
  }

  const hours = Number(expiresIn.slice(0, -1))

  return {
    secret,
    expiresInSeconds: hours * 60 * 60,
  }
}

export const env = {
  clientOrigin,
  mongodbUri,
  nodeEnv,
  port:
    Number.isInteger(configuredPort) && configuredPort > 0
      ? configuredPort
      : defaultPort,
}
