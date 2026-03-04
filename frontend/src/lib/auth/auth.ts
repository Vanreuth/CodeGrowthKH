
import {authFetch} from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest } from "./types";

const AUTH_BASE = "/api/v1/auth";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number = 401,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AuthError";
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

const isApiResponse = (value: unknown): value is ApiResponse<unknown> =>
  !!value &&
  typeof value === "object" &&
  "success" in value &&
  "message" in value &&
  "data" in value;

const OAUTH_BASE = "/api/v1/auth/oauth2";

async function requestAuthResponse<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await authFetch<T | ApiResponse<T> | null>(path, options);

  if (isApiResponse(response)) {
    return response;
  }

  return {
    success: Boolean(response),
    message: "OK",
    data: (response as T) ?? (null as unknown as T),
  };
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export async function apiRegister(
  data: RegisterRequest,
  profilePicture?: File,
): Promise<ApiResponse<void>> {
  const form = new FormData();
  form.append("username", data.username);
  form.append("email", data.email);
  if (data.phoneNumber) {
    form.append("phoneNumber", data.phoneNumber);
  }
  if (data.address) {
    form.append("address", data.address);
  }
  if (data.bio) {
    form.append("bio", data.bio);
  }
  form.append("password", data.password);
  if (data.confirmPassword) {
    form.append("confirmPassword", data.confirmPassword);
  }
  if (data.roles?.length) {
    for (const role of data.roles) {
      form.append("roles", role);
    }
  }
  if (profilePicture) {
    form.append("profilePicture", profilePicture);
  }

  return requestAuthResponse<void>(`${AUTH_BASE}/register`, {
    method: "POST",
    body: form,
  });
}

export async function apiLogin(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  return requestAuthResponse<AuthResponse>(`${AUTH_BASE}/login`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function apiRefresh(): Promise<ApiResponse<AuthResponse>> {
  return requestAuthResponse<AuthResponse>(`${AUTH_BASE}/refresh`, {
    method: "POST",
  });
}

export async function apiLogout(): Promise<ApiResponse<void>> {
  return requestAuthResponse<void>(`${AUTH_BASE}/logout`, {
    method: "POST",
  });
}

export async function apiGetMe(): Promise<ApiResponse<AuthResponse>> {
  return requestAuthResponse<AuthResponse>(`${AUTH_BASE}/me`, {
    method: "GET",
  });
}

export async function apiUpdateProfile(
  data: UpdateProfileRequest,
  photo?: File,
): Promise<ApiResponse<AuthResponse>> {
  const form = new FormData();
  if (data.username) {
    form.append("username", data.username);
  }
  if (data.phoneNumber) {
    form.append("phoneNumber", data.phoneNumber);
  }
  if (data.address) {
    form.append("address", data.address);
  }
  if (data.bio) {
    form.append("bio", data.bio);
  }
  if (photo) {
    form.append("profilePicture", photo);
  }

  return requestAuthResponse<AuthResponse>(`${AUTH_BASE}/profile`, {
    method: "PUT",
    body: form,
  });
}

// ─── Compatibility facade ─────────────────────────────────────────────────────

type LoginInput = Pick<LoginRequest, "password"> & {
  username?: string;
  email?: string;
};

export async function login(data: LoginInput): Promise<ApiResponse<AuthResponse>> {
  const username = data.username || data.email;
  if (!username) {
    return {
      success: false,
      message: "Username or email is required",
      data: null as unknown as AuthResponse,
    };
  }

  return apiLogin({ username, password: data.password });
}

export async function register(
  data: RegisterRequest,
  profilePicture?: File
): Promise<ApiResponse<void>> {
  return apiRegister(data, profilePicture);
}

export async function logout(): Promise<ApiResponse<void>> {
  return apiLogout();
}

export async function refreshToken(): Promise<ApiResponse<AuthResponse>> {
  return apiRefresh();
}

export async function getMe(): Promise<ApiResponse<AuthResponse>> {
  return apiGetMe();
}

export async function updateProfile(
  data: UpdateProfileRequest & { email?: string; currentPassword?: string; newPassword?: string },
  photo?: File,
): Promise<ApiResponse<AuthResponse>> {
  return apiUpdateProfile(data, photo);
}

// ─── Convenience aliases kept for compatibility with legacy imports ───────────

export async function fetchOAuthProviders(): Promise<string[]> {
  const response = await requestAuthResponse<string[]>(`${OAUTH_BASE}/providers`, {
    method: "GET",
  });

  if (!response.success || !response.data) {
    return [];
  }

  return response.data;
}

export async function getOAuthAuthorizationUrl(provider: string): Promise<string> {
  const response = await requestAuthResponse<string>(
    `${OAUTH_BASE}/authorize/${encodeURIComponent(provider)}`,
    {
      method: "GET",
    }
  );

  if (!response.success || !response.data) {
    throw new AuthError(response.message || "Unable to build OAuth authorization url");
  }

  return response.data;
}

export async function getAuthProfile(): Promise<AuthResponse> {
  const response = await apiGetMe();

  if (!response.data) {
    throw new AuthError("Profile is unavailable");
  }

  return response.data;
}

export async function updateProfileRequest(
  data: UpdateProfileRequest,
  photo?: File,
): Promise<AuthResponse> {
  const response = await apiUpdateProfile(data, photo);
  if (!response.data) {
    throw new AuthError(response.message || "Unable to update profile");
  }

  return response.data;
}
