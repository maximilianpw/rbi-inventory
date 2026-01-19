import { useCallback, useEffect, useMemo, useRef, useState, createContext, useContext } from 'react'
import { auth } from '@/lib/auth'
import { setTokenGetter } from '@/lib/data/axios-client'

type AuthContextValue = {
  session: any | null
  isLoading: boolean
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuthSession(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthSession must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const [session, setSession] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const getTokenRef = useRef(async () => null as string | null)
  const initialized = useRef(false)

  const loadSession = useCallback(async () => {
    try {
      const currentSession = await auth.api.getSession()
      setSession(currentSession ?? null)
    } catch (error) {
      console.error('Failed to fetch Better Auth session:', error)
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    setTokenGetter(async () => {
      try {
        return await getTokenRef.current()
      } catch (error) {
        console.error('Failed to get Better Auth token:', error)
        return null
      }
    })
  }, [])

  useEffect(() => {
    getTokenRef.current = async () => {
      const currentSession = await auth.api.getSession()
      const token =
        currentSession?.tokens?.accessToken ??
        currentSession?.token ??
        currentSession?.accessToken ??
        null
      return token ?? null
    }
  }, [])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      refreshSession: loadSession,
    }),
    [session, isLoading, loadSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
