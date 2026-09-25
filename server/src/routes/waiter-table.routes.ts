import { Router } from 'express'

import {
  addWaiterOrderItemsController,
  getWaiterActiveTableSessionController,
  listWaiterTablesController,
  openWaiterTableController,
} from '../controllers/waiter-table.controller.js'
import { cancelWaiterPaymentRequestController } from '../controllers/waiter-cancel-payment-request.controller.js'
import { confirmWaiterPaymentController } from '../controllers/waiter-confirm-payment.controller.js'
import { authenticateStaff } from '../middleware/authenticate-staff.js'
import { requireStaffRole } from '../middleware/require-staff-role.js'
import { validateRequest } from '../middleware/validate-request.js'
import { openTableRequestSchema, tableIdParamsSchema } from '../validators/table.validator.js'
import { addCustomerOrderItemsRequestSchema } from '../validators/customer-order.validator.js'

export const waiterTableRouter = Router()

waiterTableRouter.use(authenticateStaff, requireStaffRole('WAITER'))

waiterTableRouter.get('/', listWaiterTablesController)
waiterTableRouter.post(
  '/:tableId/open',
  validateRequest({ params: tableIdParamsSchema, body: openTableRequestSchema }),
  openWaiterTableController,
)
waiterTableRouter.get(
  '/:tableId/session',
  validateRequest({ params: tableIdParamsSchema }),
  getWaiterActiveTableSessionController,
)
waiterTableRouter.post(
  '/:tableId/items',
  validateRequest({ params: tableIdParamsSchema, body: addCustomerOrderItemsRequestSchema }),
  addWaiterOrderItemsController,
)
waiterTableRouter.post(
  '/:tableId/cancel-payment-request',
  validateRequest({ params: tableIdParamsSchema }),
  cancelWaiterPaymentRequestController,
)
waiterTableRouter.post(
  '/:tableId/confirm-payment',
  validateRequest({ params: tableIdParamsSchema }),
  confirmWaiterPaymentController,
)
