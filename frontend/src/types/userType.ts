

// ─────────────────────────────────────────────────────────────
//  User
// ─────────────────────────────────────────────────────────────

export interface UserResponse {
  id: number
  username: string
  email: string
  /** Array of roles returned by the backend, e.g. ["USER", "ADMIN"] */
  roles: string[]
  profile_picture?: string | null
  phoneNumber?: string | null
  address?: string | null
  bio?: string | null
  /** "ACTIVE" | "INACTIVE" | "BANNED" */
  status: string
  login_attempt?: number
  createdAt: string
  updatedAt?: string | null
}

export interface UserRequest {
  username: string
  email: string
  password: string
  roles?: string[]
  phoneNumber?: string
  address?: string
  bio?: string
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  password?: string
  roles?: string[]
  phoneNumber?: string
  address?: string
  bio?: string
  status?: string
}
