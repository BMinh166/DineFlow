import { Router } from 'express'

import {
  getWaiterActiveTableSessionController,
  listWaiterTablesController,
} from '../controllers/waiter-table.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { tableIdParamsSchema } from '../validators/table.validator.js'

export const waiterTableRouter = Router()

waiterTableRouter.use(authenticateStaff, requireStaffRole('WAITER'))

waiterTableRouter.get('/', listWaiterTablesController)
waiterTableRouter.get(
  '/:tableId/session',
  validateRequest({ params: tableIdParamsSchema }),
  getWaiterActiveTableSessionController,
)
