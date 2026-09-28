import { Router } from 'express'

import { getManagerDashboardController } from '../controllers/manager-dashboard.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'

export const managerDashboardRouter = Router()

managerDashboardRouter.use(authenticateStaff, requireStaffRole('MANAGER'))
managerDashboardRouter.get('/', getManagerDashboardController)
