import { get, post, put,buildFormData } from '@/lib/BaseApi'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '@/types/authType'

const AUTH_PATH = '/api/v1/auth'

export const authService = {
  /** POST /register — multipart/form-data */
  register: (payload: RegisterRequest, profilePicture?: File): Promise<void> => {
    const form = buildFormData(payload as unknown as Record<string, unknown>, { profilePicture })
    return post<void>(`${AUTH_PATH}/register`, form, { multipart: true, raw: true })
  },

  /** POST /login → returns AuthResponse (backend sets cookies) */
  login: (payload: LoginRequest): Promise<AuthResponse> => {
    // Backend expects { username, password } — LoginRequest.username maps directly
    return post<AuthResponse>(`${AUTH_PATH}/login`, payload)
  },

  /** POST /refresh — backend reads HttpOnly refresh cookie automatically */
  refresh: (): Promise<AuthResponse> => {
    return post<AuthResponse>(`${AUTH_PATH}/refresh`)
  },

  /** POST /logout — clears cookies server-side, then redirects */
  logout: async (): Promise<void> => {
    await post<void>(`${AUTH_PATH}/logout`, {}, { raw: true })
    if (typeof window !== 'undefined') window.location.href = '/login'
  },

  /** GET /me — returns current authenticated user */
  me: (): Promise<AuthResponse> => {
    return get<AuthResponse>(`${AUTH_PATH}/me`)
  },

  /** PUT /profile — multipart/form-data */
  updateProfile: (payload: UpdateProfileRequest, photo?: File): Promise<AuthResponse> => {
    const form = buildFormData(payload as Record<string, unknown>, { profilePicture: photo })
    return put<AuthResponse>(`${AUTH_PATH}/profile`, form, { multipart: true })
  },

  /** GET /oauth2/providers → string[] of available providers */
  getOAuthProviders: (): Promise<string[]> => {
    return get<string[]>(`${AUTH_PATH}/oauth2/providers`)
  },

  /** GET /oauth2/authorize/:provider → authorization redirect URL */
  getOAuthUrl: (provider: string): Promise<string> => {
    return get<string>(`${AUTH_PATH}/oauth2/authorize/${provider}`)
  }
}