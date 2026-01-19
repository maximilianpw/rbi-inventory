import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { auth } from '@/lib/auth'
import { useAuthSession } from '@/hooks/providers/AuthProvider'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute(): React.JSX.Element {
  const navigate = useNavigate()
  const { refreshSession } = useAuthSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await auth.api.signInEmail({
        body: {
          email,
          password,
        },
      })
      await refreshSession()
      await navigate({ to: '/' })
    } catch (err) {
      setError('Unable to sign in. Check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <h1 className="text-xl font-semibold">Sign In</h1>
          <p className="text-muted-foreground text-sm">
            Use your account email and password.
          </p>
        </div>
        <label className="block space-y-1 text-sm">
          <span>Email</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            autoComplete="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Password</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            autoComplete="current-password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-3 py-2 disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
