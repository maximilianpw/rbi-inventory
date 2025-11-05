import { z } from 'zod'

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
})

const processEnv = {
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
}

const merged = serverSchema.merge(clientSchema).safeParse(processEnv)

if (!merged.success) {
  console.error(
    '❌ Invalid environment variables:',
    merged.error.flatten().fieldErrors,
  )
  throw new Error('Invalid environment variables')
}

export const env = merged.data
