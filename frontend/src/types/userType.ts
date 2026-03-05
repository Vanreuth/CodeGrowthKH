

// ─────────────────────────────────────────────────────────────
//  User
// ─────────────────────────────────────────────────────────────

export interface UserResponse {
  id: number
  username: string
  email: string
  /** Widened to string so comparisons with 'ADMIN', 'INSTRUCTOR', 'USER' don't error */
  role: string
  profilePicture?: string
  avatar?: string | null
  phoneNumber?: string | null
  address?: string | null
  bio?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface UserRequest {
  username: string
  email: string
  password: string
  role?: string
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  password?: string
  role?: string
}
