'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { authService }                      from '../services/authService'
import {hasAdminRole } from '@/types/apiType'
import type {
  AuthResponse,
  UpdateProfileRequest,
} from '../types/authType'
import { setRoleCookie, clearRoleCookie }   from '../lib/Cookies'

// ─────────────────────────────────────────────────────────────
//  Context shape
// ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user           : AuthResponse | null
  loading        : boolean
  /** true once /me has resolved (success or fail) */
  initialized    : boolean
  isAdmin        : boolean
  isAuthenticated: boolean
  login          : (username: string, password: string) => Promise<AuthResponse>
  logout         : () => Promise<void>
  updateProfile  : (payload: UpdateProfileRequest, photo?: File) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // ── On mount: restore session from /me ───────────────────
  useEffect(() => {
    authService.me()
      .then((userData) => {
        setUser(userData)
        // Re-sync role cookie on hard refresh / new tab
        setRoleCookie(hasAdminRole(userData.roles))
      })
      .catch(() => {
        setUser(null)
        clearRoleCookie()
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (
    username: string,
    password: string
  ): Promise<AuthResponse> => {
    const userData = await authService.login({ username, password })
    setUser(userData)

    // ✅ roles is array: ["ADMIN", "USER"]
    const admin = hasAdminRole(userData.roles)

    // ✅ write plain cookie — middleware reads this to gate /dashboard
    setRoleCookie(admin)

    // ✅ role-based redirect
    window.location.href = admin ? '/dashboard' : '/account'

    return userData
  }, [])

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await authService.logout() // authService redirects to /login
    setUser(null)
    clearRoleCookie()
  }, [])

  // ── Update profile ────────────────────────────────────────
  const updateProfile = useCallback(async (
    payload: UpdateProfileRequest,
    photo?: File
  ): Promise<void> => {
    const updated = await authService.updateProfile(payload, photo)
    setUser(updated)
    setRoleCookie(hasAdminRole(updated.roles))
  }, [])

  // ── Derived state ─────────────────────────────────────────
  const isAdmin        = hasAdminRole(user?.roles)
  const isAuthenticated = !!user
  const initialized    = !loading

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        isAdmin,
        isAuthenticated,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>')
  return ctx
}