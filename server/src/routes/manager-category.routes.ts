import { Router } from 'express'
import { activateManagerCategoryController, createManagerCategoryController, deactivateManagerCategoryController, listManagerCategoriesController, updateManagerCategoryController } from '../controllers/category.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { categoryIdParamsSchema, createCategoryRequestSchema, updateCategoryRequestSchema } from '../validators/category.validator.js'

export const managerCategoryRouter = Router()

managerCategoryRouter.use(authenticateStaff, requireStaffRole('MANAGER'))

managerCategoryRouter.get('/', listManagerCategoriesController)
managerCategoryRouter.post(
  '/',
  validateRequest({ body: createCategoryRequestSchema }),
  createManagerCategoryController,
)
managerCategoryRouter.patch(
  '/:categoryId',
  validateRequest({ params: categoryIdParamsSchema, body: updateCategoryRequestSchema }),
  updateManagerCategoryController,
)
managerCategoryRouter.patch(
  '/:categoryId/activate',
  validateRequest({ params: categoryIdParamsSchema }),
  activateManagerCategoryController,
)
managerCategoryRouter.patch(
  '/:categoryId/deactivate',
  validateRequest({ params: categoryIdParamsSchema }),
  deactivateManagerCategoryController,
)
