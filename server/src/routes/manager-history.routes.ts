import { Router } from 'express'

import {
  getManagerHistoricalOrderController,
  listManagerHistoryController,
} from '../controllers/manager-history.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import {
  managerHistoryOrderIdParamsSchema,
  managerHistoryQuerySchema,
} from '../validators/manager-history.validator.js'

export const managerHistoryRouter = Router()

managerHistoryRouter.use(authenticateStaff, requireStaffRole('MANAGER'))

managerHistoryRouter.get('/', validateRequest({ query: managerHistoryQuerySchema }), listManagerHistoryController)
managerHistoryRouter.get(
  '/:orderId',
  validateRequest({ params: managerHistoryOrderIdParamsSchema }),
  getManagerHistoricalOrderController,
)
