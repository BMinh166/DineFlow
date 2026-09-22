import type { RequestHandler } from 'express'

import { assertCustomerJoinNotCoolingDown } from '../services/customer-session.service.js'

export const rejectCustomerJoinDuringCooldown: RequestHandler = (request, _response, next) => {
  assertCustomerJoinNotCoolingDown(request.params.tableId as string)
  next()
}
