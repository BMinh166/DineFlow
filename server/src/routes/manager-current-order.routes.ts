import { Router } from 'express'

import {
  getManagerCurrentOrderController,
  listManagerCurrentOrdersController,
} from '../controllers/manager-current-order.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { managerOrderIdParamsSchema } from '../validators/manager-order.validator.js'

export const managerCurrentOrderRouter = Router()

managerCurrentOrderRouter.use(authenticateStaff, requireStaffRole('MANAGER'))

managerCurrentOrderRouter.get('/', listManagerCurrentOrdersController)
managerCurrentOrderRouter.get(
  '/:orderId',
  validateRequest({ params: managerOrderIdParamsSchema }),
  getManagerCurrentOrderController,
)
