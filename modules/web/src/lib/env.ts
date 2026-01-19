import { z } from 'zod'

const serverSchema = z.object({
  BETTER_AUTH_SECRET: z.string().optional(),
})

const clientSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
})

const processEnv = {
  BETTER_AUTH_SECRET: import.meta.env.BETTER_AUTH_SECRET,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
}

const merged = serverSchema.merge(clientSchema).safeParse(processEnv)

if (!merged.success) {
  console.error(
    '❌ Invalid environment variables:',
    merged.error.flatten().fieldErrors,
  )
  console.error(
    'Make sure your .env file has VITE_API_BASE_URL set.',
  )
  throw new Error('Invalid environment variables')
}

export const env = merged.data
