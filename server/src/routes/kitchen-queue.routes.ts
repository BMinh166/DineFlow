import { Router } from 'express'

import { listKitchenQueueController } from '../controllers/kitchen-queue.controller.js'
import {
  markKitchenItemCompletedController,
  startPreparingKitchenItemController,
} from '../controllers/kitchen-item-transition.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import {
  kitchenItemActionRequestSchema,
  kitchenItemIdParamsSchema,
} from '../validators/kitchen-item-transition.validator.js'

export const kitchenQueueRouter = Router()

kitchenQueueRouter.use(authenticateStaff, requireStaffRole('KITCHEN'))

kitchenQueueRouter.get('/', listKitchenQueueController)
kitchenQueueRouter.patch(
  '/items/:itemId/start-preparing',
  validateRequest({ params: kitchenItemIdParamsSchema, body: kitchenItemActionRequestSchema }),
  startPreparingKitchenItemController,
)
kitchenQueueRouter.patch(
  '/items/:itemId/mark-completed',
  validateRequest({ params: kitchenItemIdParamsSchema, body: kitchenItemActionRequestSchema }),
  markKitchenItemCompletedController,
)
