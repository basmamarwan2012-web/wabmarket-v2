import { z } from 'zod'

export const createAdminPortfolioDomainSchema = z
  .object({
    hostname: z.string().trim().min(1).max(253),
    ownershipConfirmed: z.literal(true),
  })
  .strict()
