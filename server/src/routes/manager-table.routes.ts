import { Router } from 'express'

import { activateManagerTableController, createManagerTableController, deactivateManagerTableController, listManagerTablesController, updateManagerTableController } from '../controllers/table.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { createTableRequestSchema, tableIdParamsSchema, updateTableRequestSchema } from '../validators/table.validator.js'

export const managerTableRouter = Router()

managerTableRouter.use(authenticateStaff, requireStaffRole('MANAGER'))

managerTableRouter.get('/', listManagerTablesController)
managerTableRouter.post(
  '/',
  validateRequest({ body: createTableRequestSchema }),
  createManagerTableController,
)
managerTableRouter.patch(
  '/:tableId',
  validateRequest({ params: tableIdParamsSchema, body: updateTableRequestSchema }),
  updateManagerTableController,
)
managerTableRouter.patch(
  '/:tableId/activate',
  validateRequest({ params: tableIdParamsSchema }),
  activateManagerTableController,
)
managerTableRouter.patch(
  '/:tableId/deactivate',
  validateRequest({ params: tableIdParamsSchema }),
  deactivateManagerTableController,
)
