import { get, post, put, buildFormData } from '@/lib/api/client'
import type { ApiResponse } from '@/types/apiType'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '@/types/authType'

const AUTH_PATH = '/api/v1/auth'
// ✅ No backend URL needed in browser at all

function normalizeAuthResponse(
  user: AuthResponse,
  timestamp?: string,
): AuthResponse {
  return {
    ...user,
    createdAt: user.createdAt ?? timestamp,
  }
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await post<ApiResponse<AuthResponse>>(
    `${AUTH_PATH}/login`,
    payload,
    { raw: true },
  )
  return normalizeAuthResponse(response.data, response.timestamp)
}

export async function logout(): Promise<void> {
  await post<void>(`${AUTH_PATH}/logout`, {}, { raw: true })
}

export async function getMe(): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_PATH}/me`, {
    credentials: 'include',
    cache      : 'no-store',
  })
  if (!res.ok) throw new Error('Unauthorized')
  const data = await res.json() as ApiResponse<AuthResponse>
  return normalizeAuthResponse(data.data, data.timestamp)
}

export async function register(
  payload: RegisterRequest,
  profilePicture?: File,
): Promise<void> {
  const form = buildFormData(
    payload as unknown as Record<string, unknown>,
    { profilePicture },
  )
  return post<void>(`${AUTH_PATH}/register`, form, { multipart: true, raw: true })
}

export async function refreshToken(): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_PATH}/refresh`, {
    method     : 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Refresh failed')
  const data = await res.json() as ApiResponse<AuthResponse>
  return normalizeAuthResponse(data.data, data.timestamp)
}

export async function updateProfile(
  payload: UpdateProfileRequest,
  photo?: File,
): Promise<AuthResponse> {
  const form = buildFormData(
    payload as Record<string, unknown>,
    { profilePicture: photo },
  )
  const response = await put<ApiResponse<AuthResponse>>(
    `${AUTH_PATH}/profile`,
    form,
    { multipart: true, raw: true },
  )
  return normalizeAuthResponse(response.data, response.timestamp)
}

// ✅ Goes to Next.js route handler → handler reads API_BASE_URL server-side
// Browser never sees the backend URL
export function redirectToOAuth(provider: 'google' | 'github'): void {
  window.location.href = `/api/oauth2/${provider}`
}

export async function getOAuthProviders(): Promise<string[]> {
  return get<string[]>(`${AUTH_PATH}/oauth2/providers`)
}
