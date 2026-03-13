// context/AuthContext.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import {
  login    as apiLogin,
  logout   as apiLogout,
  getMe,
  refreshToken,
  updateProfile as apiUpdateProfile,
} from '@/lib/api/auth'
import { hasAdminRole, hasInstructorRole, hasUserRole } from '@/types/api'
import type {
  AuthResponse,
  UpdateProfileRequest,
} from '@/types/auth'

interface AuthContextValue {
  user            : AuthResponse | null
  loading         : boolean
  initialized     : boolean
  /** true while a refresh call is in-flight — prevents premature redirects */
  isRefreshing    : boolean
  isAdmin         : boolean
  isInstructor    : boolean
  isUser          : boolean
  isAuthenticated : boolean
  login           : (username: string, password: string) => Promise<AuthResponse>
  logout          : () => Promise<void>
  updateProfile   : (payload: UpdateProfileRequest, photo?: File) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,         setUser]         = useState<AuthResponse | null>(null)
  const [loading,      setLoading]      = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Prevent the bootstrap effect from running more than once
  // (React 18 Strict Mode mounts twice in dev — this guard stops double-fetches)
  const didInit = useRef(false)

  // ── On mount: restore session ─────────────────────────────────────────────
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    let cancelled = false

    async function bootstrap() {
      // ── Step 1: try /me with current access_token ────────────────────────
      try {
        const userData = await getMe()
        if (!cancelled) setUser(userData)
        return                        // ✅ already logged in — done
      } catch {
        // access_token missing or expired — fall through to refresh
      }

      // ── Step 2: try to get a new access_token via refresh_token ──────────
      setIsRefreshing(true)
      try {
        const refreshed = await refreshToken()
        if (!cancelled) setUser(refreshed)
      } catch {
        try {
          await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
        } catch {
          // backend unreachable — nothing we can do, proceed anyway
        }
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsRefreshing(false)
      }
    }

    bootstrap().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [])
  const login = useCallback(async (
    username: string,
    password: string
  ): Promise<AuthResponse> => {
    const userData = await apiLogin({ username, password })
    setUser(userData)
    return userData
  }, [])

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await apiLogout()
    if (typeof window !== 'undefined') window.location.href = '/login'
    setUser(null)
  }, [])

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (
    payload: UpdateProfileRequest,
    photo?: File
  ): Promise<void> => {
    const updated = await apiUpdateProfile(payload, photo)
    setUser(updated)
  }, [])

  const isAdmin         = hasAdminRole(user?.roles)
  const isInstructor    = hasInstructorRole(user?.roles)
  const isUser          = hasUserRole(user?.roles) && !isAdmin && !isInstructor
  const isAuthenticated = !!user
  const initialized     = !loading

  return (
    <AuthContext.Provider value={{
      user, loading, initialized, isRefreshing,
      isAdmin, isInstructor, isUser, isAuthenticated,
      login, logout, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── useAuth (alias kept for backward compat with AccountPage) ─────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

// ── useAuthContext (original name) ────────────────────────────────────────
export const useAuthContext = useAuth