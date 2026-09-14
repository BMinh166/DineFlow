import dotenv from 'dotenv'

dotenv.config()

const defaultPort = 3000
const configuredPort = Number(process.env.PORT)

export const env = {
  port:
    Number.isInteger(configuredPort) && configuredPort > 0
      ? configuredPort
      : defaultPort,
}
