import { Router } from 'express'
import { activateManagerDishController, createManagerDishController, deactivateManagerDishController, listManagerDishesController, markManagerDishAvailableController, markManagerDishUnavailableController, updateManagerDishController } from '../controllers/dish.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { createDishRequestSchema, dishIdParamsSchema, updateDishRequestSchema } from '../validators/dish.validator.js'

export const managerDishRouter = Router()

managerDishRouter.use(authenticateStaff, requireStaffRole('MANAGER'))

managerDishRouter.get('/', listManagerDishesController)
managerDishRouter.post(
  '/',
  validateRequest({ body: createDishRequestSchema }),
  createManagerDishController,
)
managerDishRouter.patch(
  '/:dishId',
  validateRequest({ params: dishIdParamsSchema, body: updateDishRequestSchema }),
  updateManagerDishController,
)
managerDishRouter.patch(
  '/:dishId/activate',
  validateRequest({ params: dishIdParamsSchema }),
  activateManagerDishController,
)
managerDishRouter.patch(
  '/:dishId/deactivate',
  validateRequest({ params: dishIdParamsSchema }),
  deactivateManagerDishController,
)
managerDishRouter.patch(
  '/:dishId/available',
  validateRequest({ params: dishIdParamsSchema }),
  markManagerDishAvailableController,
)
managerDishRouter.patch(
  '/:dishId/unavailable',
  validateRequest({ params: dishIdParamsSchema }),
  markManagerDishUnavailableController,
)
