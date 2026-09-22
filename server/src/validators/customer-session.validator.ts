import { z } from 'zod'

export const customerJoinRequestSchema = z.object({
  joinCode: z.number().int().min(1000).max(9999),
}).strict()

export type CustomerJoinRequest = z.infer<typeof customerJoinRequestSchema>
