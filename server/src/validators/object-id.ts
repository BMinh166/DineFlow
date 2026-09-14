import { Types } from 'mongoose'
import { BadRequest } from '../utils/app-error.js'

const invalidObjectIdCode = 'INVALID_OBJECT_ID'

export function assertValidObjectId(value: unknown): string {
  if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) {
    throw new BadRequest('Invalid ObjectId.', invalidObjectIdCode)
  }

  return value
}
