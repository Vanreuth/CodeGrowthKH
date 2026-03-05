import { get, post, put, del, buildFormData } from '../lib/BaseApi' // Adjust path to your new functional utilities
import type {
  PageResponse,
  PaginationParams,
} from '../types/apiType';

import type {
  UserResponse,
  UserRequest,
  UpdateUserRequest,
} from '../types/userType'

const USER_PATH = '/api/v1/users'

export const userService = {
  /** GET / — paginated user list */
  getAll: (params: PaginationParams = {}): Promise<PageResponse<UserResponse>> => {
    const { page = 0, size = 10, sortBy = 'id', sortDir = 'asc' } = params
    return get<PageResponse<UserResponse>>(USER_PATH, { params: { page, size, sortBy, sortDir } })
  },

  /** GET /:id */
  getById: (id: number): Promise<UserResponse> => {
    return get<UserResponse>(`${USER_PATH}/${id}`)
  },

  /** POST / — [ADMIN] multipart/form-data */
  create: (payload: UserRequest, profilePicture?: File): Promise<UserResponse> => {
    const form = buildFormData(payload as unknown as Record<string, unknown>, { profilePicture })
    return post<UserResponse>(USER_PATH, form, { multipart: true })
  },

  /** PUT /:id — [ADMIN] multipart/form-data */
  update: (id: number, payload: UpdateUserRequest, photo?: File): Promise<UserResponse> => {
    const form = buildFormData(payload as unknown as Record<string, unknown>, { profilePicture: photo })
    return put<UserResponse>(`${USER_PATH}/${id}`, form, { multipart: true })
  },

  /** DELETE /:id — [ADMIN] */
  remove: (id: number): Promise<void> => {
    return del<void>(`${USER_PATH}/${id}`, { raw: true })
  }
}