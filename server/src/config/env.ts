import dotenv from 'dotenv'

dotenv.config()

const defaultPort = 3000
const defaultClientOrigin = 'http://localhost:5173'
const configuredPort = Number(process.env.PORT)
const clientOrigin = process.env.CLIENT_ORIGIN?.trim() || defaultClientOrigin
const mongodbUri = process.env.MONGODB_URI?.trim()

export const env = {
  clientOrigin,
  mongodbUri,
  port:
    Number.isInteger(configuredPort) && configuredPort > 0
      ? configuredPort
      : defaultPort,
}
