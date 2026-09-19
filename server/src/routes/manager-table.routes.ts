import { Router } from 'express'

import { createManagerTableController, listManagerTablesController } from '../controllers/table.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { createTableRequestSchema } from '../validators/table.validator.js'

export const managerTableRouter = Router()

managerTableRouter.use(authenticateStaff, requireStaffRole('MANAGER'))

managerTableRouter.get('/', listManagerTablesController)
managerTableRouter.post(
  '/',
  validateRequest({ body: createTableRequestSchema }),
  createManagerTableController,
)
