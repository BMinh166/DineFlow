import { Router } from 'express'

import { listManagerTopDishesController } from '../controllers/manager-top-dishes.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'

export const managerTopDishesRouter = Router()

managerTopDishesRouter.use(authenticateStaff, requireStaffRole('MANAGER'))
managerTopDishesRouter.get('/', listManagerTopDishesController)
