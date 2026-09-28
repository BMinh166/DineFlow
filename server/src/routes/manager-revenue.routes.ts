import { Router } from 'express'

import { getManagerRevenueSummaryController } from '../controllers/manager-revenue.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { managerRevenueQuerySchema } from '../validators/manager-revenue.validator.js'

export const managerRevenueRouter = Router()

managerRevenueRouter.use(authenticateStaff, requireStaffRole('MANAGER'))
managerRevenueRouter.get('/', validateRequest({ query: managerRevenueQuerySchema }), getManagerRevenueSummaryController)
