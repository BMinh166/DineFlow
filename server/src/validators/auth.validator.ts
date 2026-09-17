import { z } from 'zod'

export const staffLoginRequestSchema = z
  .object({
    identifier: z.string().trim().min(1),
    password: z.string().min(1),
  })
  .strict()

export type StaffLoginRequest = z.infer<typeof staffLoginRequestSchema>
