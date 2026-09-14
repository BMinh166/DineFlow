import dotenv from 'dotenv'

dotenv.config()

const defaultPort = 3000
const configuredPort = Number(process.env.PORT)
const mongodbUri = process.env.MONGODB_URI?.trim()

export const env = {
  mongodbUri,
  port:
    Number.isInteger(configuredPort) && configuredPort > 0
      ? configuredPort
      : defaultPort,
}
