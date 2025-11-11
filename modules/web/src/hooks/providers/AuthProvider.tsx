'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { setTokenGetter } from '@/lib/data/axios-client'

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const { getToken } = useAuth()

  useEffect(() => {
    setTokenGetter(async () => {
      try {
        return await getToken()
      } catch (error) {
        console.error('Failed to get Clerk token:', error)
        return null
      }
    })
  }, [getToken])

  return <>{children}</>
}
