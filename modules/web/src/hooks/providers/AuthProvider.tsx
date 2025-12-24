'use client'

import { useAuth } from '@clerk/nextjs'
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

  // Update ref without triggering re-renders
  useEffect(() => {
    getTokenRef.current = getToken
  }, [getToken])

  // Register token getter on mount
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
