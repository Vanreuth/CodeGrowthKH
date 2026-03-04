
export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  bio?: string | null;
  roles?: string[];
  profilePicture?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  password: string;
  confirmPassword?: string;
  roles?: string[];
}

export interface UpdateProfileRequest {
  username?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
}
