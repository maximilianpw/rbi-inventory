import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

// TODO: Fill Better Auth configuration once installation details are provided.
export const auth = betterAuth({
  // ...your config
  plugins: [tanstackStartCookies()],
})
