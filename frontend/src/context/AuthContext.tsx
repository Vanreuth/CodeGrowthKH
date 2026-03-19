'use client'

import {
  createContext, useContext, useEffect,
  useRef, useState, useCallback, ReactNode,
} from 'react'
import {
  login as apiLogin, logout as apiLogout,
  getMe, refreshToken, updateProfile as apiUpdateProfile,
} from '@/lib/api/auth'
import { hasAdminRole, hasUserRole } from '@/types/api'
import type { AuthResponse, UpdateProfileRequest } from '@/types/auth'

interface AuthContextValue {
  user            : AuthResponse | null
  loading         : boolean
  initialized     : boolean
  isRefreshing    : boolean
  isAdmin         : boolean
  isUser          : boolean
  isAuthenticated : boolean
  login           : (username: string, password: string) => Promise<AuthResponse>
  logout          : () => Promise<void>
  updateProfile   : (payload: UpdateProfileRequest, photo?: File) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,         setUser]         = useState<AuthResponse | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const didInit = useRef(false)

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    // ✅ ONE cancelled var, used by the whole effect
    let cancelled = false

    async function bootstrap() {
      try {
        // Step 1: try existing access_token
        try {
          const userData = await getMe()
          if (!cancelled) setUser(userData)
          return // ✅ valid — done
        } catch {
          // access_token expired/missing → fall through to refresh
        }

        // Step 2: refresh immediately
        if (!cancelled) setIsRefreshing(true)

        try {
          const userData = await refreshToken()
          if (!cancelled) setUser(userData)
        } catch {
          // Both tokens invalid → clear session
          try {
            await fetch('/api/v1/auth/logout', {
              method: 'POST',
              credentials: 'include',
            })
          } catch {}
          if (!cancelled) setUser(null)
        }

      } finally {
        // ✅ ONE place — always unblocks spinner
        if (!cancelled) {
          setIsRefreshing(false)
          setLoading(false)      // initialized = !loading = true
        }
      }
    }

    bootstrap()

    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (
    username: string, password: string
  ): Promise<AuthResponse> => {
    const userData = await apiLogin({ username, password })
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    await apiLogout()
    setUser(null)
    if (typeof window !== 'undefined') window.location.href = '/login'
  }, [])

  const updateProfile = useCallback(async (
    payload: UpdateProfileRequest, photo?: File
  ): Promise<void> => {
    const updated = await apiUpdateProfile(payload, photo)
    setUser(updated)
  }, [])

  const isAdmin         = hasAdminRole(user?.roles)
  const isUser          = hasUserRole(user?.roles) && !isAdmin
  const isAuthenticated = !!user
  const initialized     = !loading   // ✅ derived — no separate state needed

  return (
    <AuthContext.Provider value={{
      user, loading, initialized, isRefreshing,
      isAdmin, isUser, isAuthenticated,
      login, logout, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

export const useAuthContext = useAuth
