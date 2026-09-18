import { Router } from 'express'
import { createManagerDishController, listManagerDishesController } from '../controllers/dish.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { createDishRequestSchema } from '../validators/dish.validator.js'

export const managerDishRouter = Router()

managerDishRouter.use(authenticateStaff, requireStaffRole('MANAGER'))

managerDishRouter.get('/', listManagerDishesController)
managerDishRouter.post(
  '/',
  validateRequest({ body: createDishRequestSchema }),
  createManagerDishController,
)
