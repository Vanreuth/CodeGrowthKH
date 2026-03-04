// app/actions/auth.actions.ts
"use server";

import { redirect } from "next/navigation";
import * as Auth from "@/lib/auth";

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  try {
    const result = await Auth.login({ email, password });

    if (!result.success) {
      return { error: result.message };
    }
  } catch (err) {
    if (err instanceof Auth.AuthError) {
      return { error: err.message };
    }
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(formData: FormData) {
  const username       = formData.get("username")       as string;
  const email          = formData.get("email")          as string;
  const password       = formData.get("password")       as string;
  const profilePicture = formData.get("profilePicture") as File | null;

  try {
    const result = await Auth.register(
      { username, email, password },
      profilePicture ?? undefined
    );

    if (!result.success) {
      return { error: result.message };
    }
  } catch (err) {
    if (err instanceof Auth.AuthError) {
      return { error: err.message };
    }
    return { error: "Registration failed. Please try again." };
  }

  redirect("/login?registered=true");
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction() {
  try {
    await Auth.logout();
  } catch {
    // Clear cookies regardless
  }
  redirect("/login");
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfileAction(formData: FormData) {
  const photo = formData.get("profilePicture") as File | null;

  try {
    const result = await Auth.updateProfile(
      {
        username:        (formData.get("username")        as string) || undefined,
        email:           (formData.get("email")           as string) || undefined,
        currentPassword: (formData.get("currentPassword") as string) || undefined,
        newPassword:     (formData.get("newPassword")     as string) || undefined,
      },
      photo ?? undefined
    );

    if (!result.success) {
      return { error: result.message };
    }

    return { success: true, data: result.data };
  } catch (err) {
    if (err instanceof Auth.AuthError) {
      return { error: err.message };
    }
    return { error: "Failed to update profile." };
  }
}