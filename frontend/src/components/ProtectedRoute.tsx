
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth }   from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
  redirectTo?: string;
  allowedRoles?: string[];
  unauthorizedRedirectTo?: string;
}
export default function ProtectedRoute({
  children,
  redirectTo = "/login",
  allowedRoles,
  unauthorizedRedirectTo = "/",
}: Props) {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const hasAllowedRole =
    !allowedRoles?.length || !!user?.roles?.some((role) => allowedRoles.includes(role));

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (!hasAllowedRole) {
      router.replace(unauthorizedRedirectTo);
    }
  }, [initialized, user, hasAllowedRole, router, redirectTo, unauthorizedRedirectTo]);

  // Still checking session
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated (will redirect via useEffect)
  if (!user) return null;
  if (!hasAllowedRole) return null;

  return <>{children}</>;
}
