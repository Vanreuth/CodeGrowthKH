'use client'

import { useAuthContext } from '../context/AuthContext'

/**
 * useAuth — convenience re-export of useAuthContext.
 *
 * Usage:
 *   const { user, isAdmin, login, logout } = useAuth()
 */
export function useAuth() {
  return useAuthContext()
}