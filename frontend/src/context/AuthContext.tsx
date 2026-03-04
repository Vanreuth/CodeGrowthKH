// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest } from "@/lib/auth/types";
import {
  apiLogin,
  apiLogout,
  apiRegister,
  apiGetMe,
  apiUpdateProfile,
  apiRefresh,
} from "@/lib/auth/auth";

import { ApiError } from "@/lib/types"; 

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Currently authenticated user, or null */
  user: AuthResponse | null;
  /** True while any auth request is in-flight */
  loading: boolean;
  /** True once the initial /me check has completed */
  initialized: boolean;

  login:         (data: LoginRequest)          => Promise<AuthResponse>;
  register:      (data: RegisterRequest, profilePicture?: File) => Promise<void>;
  logout:        ()                            => Promise<void>;
  updateProfile: (data: UpdateProfileRequest, photo?: File) => Promise<void>;
  refreshToken:  ()                            => Promise<void>;
  syncSession:   ()                            => Promise<AuthResponse | null>;
}

// ─── Context + hook ───────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,        setUser]        = useState<AuthResponse | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [initialized, setInitialized] = useState(false);

  const syncSession = useCallback(async (): Promise<AuthResponse | null> => {
    try {
      const me = await apiGetMe();
      if (me.data) {
        setUser(me.data);
        return me.data;
      }
    } catch {
      // Try silent refresh (browser sends refresh_token HttpOnly cookie)
      try {
        const res = await apiRefresh();
        if (res.data) {
          setUser(res.data);
          return res.data;
        }
      } catch {
        // No valid session — stay logged out
      }
    }

    return null;
  }, []);

  // ── On mount: restore session ──────────────────────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      try {
        await syncSession();
      } finally {
        setInitialized(true);
      }
    }

    restoreSession();
  }, [syncSession]);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      const res = await apiLogin(data);
      if (!res.data) throw new ApiError(401, res.message);

      setUser(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (data: RegisterRequest, profilePicture?: File) => {
    setLoading(true);
    try {
      const res = await apiRegister(data, profilePicture);
      if (!res.success) throw new ApiError(400, res.message);
      // Registration doesn't log in automatically — redirect to /login
    } finally {
      setLoading(false);
    }
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  // ── updateProfile ──────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (data: UpdateProfileRequest, photo?: File) => {
    setLoading(true);
    try {
      const res = await apiUpdateProfile(data, photo);
      if (!res.data) throw new ApiError(400, res.message);

      setUser(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── refreshToken ───────────────────────────────────────────────────────────
  const refreshToken = useCallback(async () => {
    const res = await apiRefresh();
    if (res.data) {
      setUser(res.data);
    }
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{ user, loading, initialized, login, register, logout, updateProfile, refreshToken, syncSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}
