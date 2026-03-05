'use client'

import { useEffect }   from 'react'
import { useRouter }   from 'next/navigation'
import { useAuth }     from '../../hooks/useAuth'

interface AuthGuardProps {
  children   : React.ReactNode
  requireAdmin?: boolean
  fallback?  : React.ReactNode
}
export default function AuthGuard({
  children,
  requireAdmin = false,
  fallback     = null,
}: AuthGuardProps) {
  const { user, loading, initialized, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) return

    if (!user) {
      router.replace('/login')
      return
    }

    if (requireAdmin && !isAdmin) {
      router.replace('/account')
    }
  }, [initialized, user, isAdmin, requireAdmin, router])

  // Still loading session
  if (!initialized) {
    return fallback ?? (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  // Not authenticated
  if (!user) return null

  // Authenticated but not admin
  if (requireAdmin && !isAdmin) return null

  return <>{children}</>
}