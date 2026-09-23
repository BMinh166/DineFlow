import { Router } from 'express'

import { getCustomerCurrentOrderController } from '../controllers/customer-current-order.controller.js'
import { addCustomerOrderItemsController } from '../controllers/customer-order.controller.js'
import { authenticateCustomerSession } from '../middleware/authenticate-customer-session.js'
import { validateRequest } from '../middleware/validate-request.js'
import { addCustomerOrderItemsRequestSchema } from '../validators/customer-order.validator.js'

export const customerOrderRouter = Router()

customerOrderRouter.use(authenticateCustomerSession)

customerOrderRouter.get('/current', getCustomerCurrentOrderController)
customerOrderRouter.post('/items', validateRequest({ body: addCustomerOrderItemsRequestSchema }), addCustomerOrderItemsController)
