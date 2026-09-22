import { Router } from 'express'

import {
  getWaiterActiveTableSessionController,
  listWaiterTablesController,
  openWaiterTableController,
} from '../controllers/waiter-table.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { openTableRequestSchema, tableIdParamsSchema } from '../validators/table.validator.js'

export const waiterTableRouter = Router()

waiterTableRouter.use(authenticateStaff, requireStaffRole('WAITER'))

waiterTableRouter.get('/', listWaiterTablesController)
waiterTableRouter.post(
  '/:tableId/open',
  validateRequest({ params: tableIdParamsSchema, body: openTableRequestSchema }),
  openWaiterTableController,
)
waiterTableRouter.get(
  '/:tableId/session',
  validateRequest({ params: tableIdParamsSchema }),
  getWaiterActiveTableSessionController,
)
