import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must contain at least 2 characters.'),
    email: z.string().email('Enter a valid email address.'),
    password: z
      .string()
      .min(12, 'Password must contain at least 12 characters.')
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/[0-9]/, 'Password must contain a number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a symbol.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const domainSchema = z.object({
  domainName: z
    .string()
    .min(3, 'Domain name is required.')
    .transform((value) => value.trim().toLowerCase()),

  registrar: z.string().optional(),

  keyword: z.string().optional(),

  city: z.string().optional(),

  country: z.string().optional(),

  purchasePrice: z.coerce.number().min(0, 'Purchase price cannot be negative.'),

  estimatedPrice: z.coerce
    .number()
    .min(0, 'Estimated price cannot be negative.'),

  askingPrice: z.coerce.number().min(0, 'Asking price cannot be negative.'),

  flipScore: z.coerce.number().min(0).max(100),

  status: z.enum(['opportunity', 'active', 'sold', 'expired', 'archived']),
})

export const leadSchema = z.object({
  companyName: z.string().min(2),
  email: z.string().email(),
  website: z.string().url().optional().or(z.literal('')),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type DomainInput = z.infer<typeof domainSchema>
export type LeadInput = z.infer<typeof leadSchema>
