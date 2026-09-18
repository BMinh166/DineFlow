import { Router } from 'express'
import { createManagerCategoryController, listManagerCategoriesController } from '../controllers/category.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { createCategoryRequestSchema } from '../validators/category.validator.js'

export const managerCategoryRouter = Router()

managerCategoryRouter.use(authenticateStaff, requireStaffRole('MANAGER'))

managerCategoryRouter.get('/', listManagerCategoriesController)
managerCategoryRouter.post(
  '/',
  validateRequest({ body: createCategoryRequestSchema }),
  createManagerCategoryController,
)
