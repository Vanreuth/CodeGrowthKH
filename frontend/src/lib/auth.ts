// /**
//  * Backward-compatibility bridge.
//  *
//  * Many pages and components import auth helpers from this path.
//  * All logic lives in AuthContext / authService — this file re-exports
//  * them under the names that were used before the service-layer refactor.
//  */

// export { useAuthContext as useAuth } from '../context/AuthContext'
// export type { AuthResponse, RegisterRequest, UpdateProfileRequest, LoginRequest } from '../types/api.types'

// import { authService } from '../services/authService'
// import type { AuthResponse, RegisterRequest, UpdateProfileRequest } from '../types/api.types'

// /** Fetch the current authenticated user */
// export const getMe = (): Promise<AuthResponse> => authService.me()

// /**
//  * Login — accepts username or email as the identifier.
//  * Sends `username` to match the Spring Boot backend field.
//  */
// export const login = (payload: {
//   username?: string
//   email?: string
//   password: string
// }): Promise<AuthResponse> =>
//   authService.login({
//     username: payload.username ?? payload.email ?? '',
//     password: payload.password,
//   })

  
// /** Logout — clears server-side cookies and redirects to /login */
// export const logout = (): Promise<void> => authService.logout()

// /**
//  * Register a new account.
//  * Accepts an optional `profilePicture` and `confirmPassword` (ignored server-side).
//  */
// export const register = (
//   payload: RegisterRequest & { profilePicture?: File; confirmPassword?: string }
// ): Promise<void> => {
//   const { profilePicture, confirmPassword: _unused, ...rest } = payload
//   return authService.register(rest, profilePicture)
// }

// /** Update the authenticated user's profile */
// export const updateProfile = (
//   payload: UpdateProfileRequest,
//   photo?: File
// ): Promise<AuthResponse> => authService.updateProfile(payload, photo)

// /** Get the OAuth2 redirect URL for a provider */
// export const getOAuthUrl = (provider: string): Promise<string> =>
//   authService.getOAuthUrl(provider)
