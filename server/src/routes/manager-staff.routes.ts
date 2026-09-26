import { Router } from 'express'

import { activateManagerStaffController, createManagerStaffController, deactivateManagerStaffController, listManagerStaffController, updateManagerStaffController } from '../controllers/staff.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { createStaffRequestSchema, staffIdParamsSchema, updateStaffRequestSchema } from '../validators/staff.validator.js'

export const managerStaffRouter = Router()

managerStaffRouter.use(authenticateStaff, requireStaffRole('MANAGER'))

managerStaffRouter.get('/', listManagerStaffController)
managerStaffRouter.post(
  '/',
  validateRequest({ body: createStaffRequestSchema }),
  createManagerStaffController,
)
managerStaffRouter.patch(
  '/:staffId',
  validateRequest({ params: staffIdParamsSchema, body: updateStaffRequestSchema }),
  updateManagerStaffController,
)
managerStaffRouter.patch(
  '/:staffId/activate',
  validateRequest({ params: staffIdParamsSchema }),
  activateManagerStaffController,
)
managerStaffRouter.patch(
  '/:staffId/deactivate',
  validateRequest({ params: staffIdParamsSchema }),
  deactivateManagerStaffController,
)
