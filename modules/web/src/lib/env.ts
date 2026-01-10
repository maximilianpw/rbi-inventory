import { z } from 'zod'

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().optional(),
})

const clientSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  VITE_API_BASE_URL: z.string().url(),
})

const processEnv = {
  CLERK_SECRET_KEY: import.meta.env.CLERK_SECRET_KEY,
  VITE_CLERK_PUBLISHABLE_KEY:
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  VITE_API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL,
}

const merged = serverSchema.merge(clientSchema).safeParse(processEnv)

if (!merged.success) {
  console.error(
    '❌ Invalid environment variables:',
    merged.error.flatten().fieldErrors,
  )
  console.error(
    'Make sure your .env file has VITE_API_BASE_URL and VITE_CLERK_PUBLISHABLE_KEY set.',
  )
  throw new Error('Invalid environment variables')
}

export const env = merged.data
