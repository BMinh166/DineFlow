import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import { notFoundHandler } from './middleware/not-found.js'
import { healthRouter } from './routes/health.routes.js'

export const app = express()

app.use(cors({ origin: env.clientOrigin }))
app.use(express.json())
app.use('/api/health', healthRouter)
app.use(notFoundHandler)
app.use(errorHandler)
