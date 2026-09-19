import { Router } from 'express'

import { getPublicTableController } from '../controllers/public-table.controller.js'
import { validateRequest } from '../middleware/validate-request.js'
import { publicTableIdParamsSchema } from '../validators/public-table.validator.js'

export const publicTableRouter = Router()

publicTableRouter.get(
  '/:tableId',
  validateRequest({ params: publicTableIdParamsSchema }),
  getPublicTableController,
)
