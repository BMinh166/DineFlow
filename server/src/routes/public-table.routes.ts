import { Router } from 'express'

import { getPublicTableController } from '../controllers/public-table.controller.js'
import { joinCustomerTableController } from '../controllers/customer-session.controller.js'
import { rejectCustomerJoinDuringCooldown } from '../middleware/customer-join-cooldown.js'
import { validateRequest } from '../middleware/validate-request.js'
import { publicTableIdParamsSchema } from '../validators/public-table.validator.js'
import { customerJoinRequestSchema } from '../validators/customer-session.validator.js'

export const publicTableRouter = Router()

publicTableRouter.post(
  '/:tableId/join',
  validateRequest({ params: publicTableIdParamsSchema }),
  rejectCustomerJoinDuringCooldown,
  validateRequest({ body: customerJoinRequestSchema }),
  joinCustomerTableController,
)

publicTableRouter.get(
  '/:tableId',
  validateRequest({ params: publicTableIdParamsSchema }),
  getPublicTableController,
)
