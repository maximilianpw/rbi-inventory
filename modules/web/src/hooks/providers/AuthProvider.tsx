import { useAuth } from '@clerk/tanstack-react-start'
import { useEffect, useRef } from 'react'
import { setTokenGetter } from '@/lib/data/axios-client'

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const { getToken } = useAuth()
  const getTokenRef = useRef(getToken)
  const initialized = useRef(false)

  useEffect(() => {
    getTokenRef.current = getToken
  }, [getToken])

  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    setTokenGetter(async () => {
      try {
        return await getTokenRef.current()
      } catch (error) {
        console.error('Failed to get Clerk token:', error)
        return null
      }
    })
  }, [])

  return <>{children}</>
}
