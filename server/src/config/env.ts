import dotenv from 'dotenv'

dotenv.config()

const defaultPort = 3000
const defaultClientOrigin = 'http://localhost:5173'
const configuredPort = Number(process.env.PORT)
const clientOrigin = process.env.CLIENT_ORIGIN?.trim() || defaultClientOrigin
const mongodbUri = process.env.MONGODB_URI?.trim()
const nodeEnv = process.env.NODE_ENV?.trim() || 'development'

export const env = {
  clientOrigin,
  mongodbUri,
  nodeEnv,
  port:
    Number.isInteger(configuredPort) && configuredPort > 0
      ? configuredPort
      : defaultPort,
}
