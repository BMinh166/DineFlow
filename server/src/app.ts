import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { developmentRequestLogger } from './middleware/development-request-logger.js'
import { errorHandler } from './middleware/error-handler.js'
import { notFoundHandler } from './middleware/not-found.js'
import { authRouter } from './routes/auth.routes.js'
import { healthRouter } from './routes/health.routes.js'
import { managerCategoryRouter } from './routes/manager-category.routes.js'
import { managerDishRouter } from './routes/manager-dish.routes.js'
import { publicMenuRouter } from './routes/public-menu.routes.js'

export const app = express()

app.use(cors({ origin: env.clientOrigin }))
if (env.nodeEnv === 'development') {
  app.use(developmentRequestLogger)
}
app.use(express.json({ limit: '100kb' }))
app.use('/api/auth', authRouter)
app.use('/api/health', healthRouter)
app.use('/api/manager/categories', managerCategoryRouter)
app.use('/api/manager/dishes', managerDishRouter)
app.use('/api/public/menu', publicMenuRouter)
app.use(notFoundHandler)
app.use(errorHandler)
