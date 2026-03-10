import { get, post, put,buildFormData } from '@/lib/BaseApi'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '@/types/authType'

const AUTH_PATH = '/api/v1/auth'

export const authService = {
  register: (payload: RegisterRequest, profilePicture?: File): Promise<void> => {
    const form = buildFormData(payload as unknown as Record<string, unknown>, { profilePicture })
    return post<void>(`${AUTH_PATH}/register`, form, { multipart: true, raw: true })
  },

  login: (payload: LoginRequest): Promise<AuthResponse> => {
    return post<AuthResponse>(`${AUTH_PATH}/login`, payload)
  },

  refresh: (): Promise<AuthResponse> => {
    return post<AuthResponse>(`${AUTH_PATH}/refresh`)
  },

  logout: async (): Promise<void> => {
    await post<void>(`${AUTH_PATH}/logout`, {}, { raw: true })
    if (typeof window !== 'undefined') window.location.href = '/login'
  },

  me: (): Promise<AuthResponse> => {
    return get<AuthResponse>(`${AUTH_PATH}/me`)
  },

  updateProfile: (payload: UpdateProfileRequest, photo?: File): Promise<AuthResponse> => {
    const form = buildFormData(payload as Record<string, unknown>, { profilePicture: photo })
    return put<AuthResponse>(`${AUTH_PATH}/profile`, form, { multipart: true })
  },

  getOAuthProviders: (): Promise<string[]> => {
    return get<string[]>(`${AUTH_PATH}/oauth2/providers`)
  },
  getOAuthUrl: (provider: string): Promise<string> => {
    return get<string>(`${AUTH_PATH}/oauth2/authorize/${provider}`)
  }
}