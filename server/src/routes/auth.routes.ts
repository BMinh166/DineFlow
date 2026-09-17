import { Router } from 'express'

import { loginStaffController } from '../controllers/auth.controller.js'
import { validateRequest } from '../middleware/validate-request.js'
import { staffLoginRequestSchema } from '../validators/auth.validator.js'

export const authRouter = Router()

authRouter.post(
  '/login',
  validateRequest({ body: staffLoginRequestSchema }),
  loginStaffController,
)
