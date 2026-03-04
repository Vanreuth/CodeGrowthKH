export type UserRole = "ADMIN" | "INSTRUCTOR" | "USER" | string;
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED" | string;

export interface UserDto {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  bio?: string | null;
  avatar?: string | null;
  profilePicture?: string | null;
  role: UserRole;
  roles?: UserRole[];
  isActive: boolean;
  status?: UserStatus | null;
  loginAttempt?: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  phoneNumber?: string | null;
  address?: string | null;
  bio?: string | null;
  avatar?: string | null;
  profilePicture?: string | null;
  isActive?: boolean;
  role?: UserRole;
}
