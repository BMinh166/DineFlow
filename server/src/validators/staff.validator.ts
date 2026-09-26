import { z } from 'zod'

import { STAFF_ROLES } from '../types/staff-role.js'
import { assertValidObjectId } from './object-id.js'

export const createStaffRequestSchema = z
  .object({
    name: z.string().min(1),
    username: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum(STAFF_ROLES),
    active: z.boolean().optional(),
  })
  .strict()

export type CreateStaffRequest = z.infer<typeof createStaffRequestSchema>

export const updateStaffRequestSchema = z
  .object({
    name: z.string().min(1).optional(),
    username: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.enum(STAFF_ROLES).optional(),
  })
  .strict()
  .refine(value => Object.keys(value).length > 0)

export type UpdateStaffRequest = z.infer<typeof updateStaffRequestSchema>

export const staffIdParamsSchema = z.object({
  staffId: z.string().transform(assertValidObjectId),
}).strict()
