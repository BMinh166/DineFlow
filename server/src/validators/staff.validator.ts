import { z } from 'zod'

import { STAFF_ROLES } from '../types/staff-role.js'

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
