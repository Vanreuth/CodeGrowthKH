/**
 * lib/api/users.ts
 *
 * CRUD operations for the /api/v1/users endpoint.
 *
 * Usage:
 *   import { fetchUsers, fetchUser, createUser } from '@/lib/api/users'
 */

import { get, post, put, del } from '@/lib/api/client'
import type { PageResponse, PaginationParams } from '@/types/apiType'
import type {
  UserResponse,
  UserRequest,
  UpdateUserRequest,
} from '@/types/userType'

const USER_PATH = '/api/v1/users'
type UserListParams = PaginationParams & {
  search?: string
  status?: string
}

function appendIfDefined(form: FormData, key: string, value: string | undefined) {
  if (value === undefined) return
  form.append(key, value)
}

function buildUserFormData(
  payload: UserRequest | UpdateUserRequest,
  profilePicture?: File
): FormData {
  const form = new FormData()

  appendIfDefined(form, 'username', payload.username)
  appendIfDefined(form, 'email', payload.email)
  appendIfDefined(form, 'password', payload.password)
  appendIfDefined(form, 'phoneNumber', payload.phoneNumber)
  appendIfDefined(form, 'address', payload.address)
  appendIfDefined(form, 'bio', payload.bio)
  appendIfDefined(form, 'status', payload.status)

  if (Array.isArray(payload.roles)) {
    payload.roles.forEach((role) => {
      if (role) form.append('roles', role)
    })
  }

  if (profilePicture) {
    form.append('profilePicture', profilePicture)
  }

  return form
}

/** GET /users — paginated list of all users. */
export async function fetchUsers(
  params: UserListParams = {}
): Promise<PageResponse<UserResponse>> {
  const { page = 0, size = 10, sortBy = 'id', sortDir = 'asc', search, status } = params
  return get<PageResponse<UserResponse>>(USER_PATH, {
    params: { page, size, sortBy, sortDir, search, status },
  })
}

/** GET /users/:id — fetch a single user by ID. */
export async function fetchUser(id: number): Promise<UserResponse> {
  return get<UserResponse>(`${USER_PATH}/${id}`)
}

/** POST /users — [ADMIN] create a user. Optionally attaches a profile picture. */
export async function createUser(
  payload: UserRequest,
  profilePicture?: File
): Promise<UserResponse> {
  const form = buildUserFormData(payload, profilePicture)
  return post<UserResponse>(USER_PATH, form, { multipart: true })
}

/** PUT /users/:id — [ADMIN] update a user's details. */
export async function updateUser(
  id: number,
  payload: UpdateUserRequest,
  profilePicture?: File
): Promise<UserResponse> {
  const form = buildUserFormData(payload, profilePicture)
  return put<UserResponse>(`${USER_PATH}/${id}`, form, { multipart: true })
}

/** DELETE /users/:id — [ADMIN] remove a user. */
export async function deleteUser(id: number): Promise<void> {
  return del<void>(`${USER_PATH}/${id}`, { raw: true })
}
