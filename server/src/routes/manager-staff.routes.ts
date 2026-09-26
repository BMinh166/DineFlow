import { Router } from 'express'

import { createManagerStaffController, listManagerStaffController } from '../controllers/staff.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { createStaffRequestSchema } from '../validators/staff.validator.js'

export const managerStaffRouter = Router()

managerStaffRouter.use(authenticateStaff, requireStaffRole('MANAGER'))

managerStaffRouter.get('/', listManagerStaffController)
managerStaffRouter.post(
  '/',
  validateRequest({ body: createStaffRequestSchema }),
  createManagerStaffController,
)
