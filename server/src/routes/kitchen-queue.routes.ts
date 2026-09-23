import { Router } from 'express'

import { listKitchenQueueController } from '../controllers/kitchen-queue.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'

export const kitchenQueueRouter = Router()

kitchenQueueRouter.use(authenticateStaff, requireStaffRole('KITCHEN'))

kitchenQueueRouter.get('/', listKitchenQueueController)
