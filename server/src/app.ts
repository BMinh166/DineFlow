import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { developmentRequestLogger } from './middleware/development-request-logger.js'
import { errorHandler } from './middleware/error-handler.js'
import { notFoundHandler } from './middleware/not-found.js'
import { healthRouter } from './routes/health.routes.js'

export const app = express()

app.use(cors({ origin: env.clientOrigin }))
if (env.nodeEnv === 'development') {
  app.use(developmentRequestLogger)
}
app.use(express.json({ limit: '100kb' }))
app.use('/api/health', healthRouter)
app.use(notFoundHandler)
app.use(errorHandler)
