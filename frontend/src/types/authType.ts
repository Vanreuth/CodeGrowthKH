// ─────────────────────────────────────────────────────────────
//  Auth
// ─────────────────────────────────────────────────────────────

export interface AuthResponse {
  id: number
  username: string
  email: string
  role: 'ROLE_USER' | 'ROLE_ADMIN'
  profilePicture?: string
  accessToken?: string
  phoneNumber?: string | null
  address?: string | null
  bio?: string | null
  roles?: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword?: string
  phoneNumber?: string
  address?: string
  bio?: string
}

export interface UpdateProfileRequest {
  username?: string
  email?: string
  password?: string
  phoneNumber?: string | null
  address?: string | null
  bio?: string | null
}
