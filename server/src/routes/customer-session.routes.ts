import { Router } from 'express'

import { getCustomerSessionController } from '../controllers/customer-session.controller.js'
import { authenticateCustomerSession } from '../middleware/authenticate-customer-session.js'

export const customerSessionRouter = Router()

customerSessionRouter.get('/', authenticateCustomerSession, getCustomerSessionController)
