"use client"

import { useState, ChangeEvent, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { register } from "@/hooks/useAuth"
import type { RegisterRequest } from "@/types/authType"
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs ${
      met ? "text-green-400" : "text-slate-500"
    }`}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </span>
  )
}

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [profilePicture, setProfilePicture] = useState<File | undefined>()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setProfilePicture(e.target.files[0])
  }

  const passwordRules = useMemo(() => ({
    length: form.password.length >= 6,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  }), [form.password])

  const passwordValid = Object.values(passwordRules).every(Boolean)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await register({ ...form, profilePicture })
      router.push("/login")
    } catch {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-[#16213e] border border-white/10 rounded-2xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Create Account
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Join our learning community
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name hidden — username is the identity */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-slate-300 text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Choose username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              className="bg-[#0f3460]/60 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="bg-[#0f3460]/60 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="bg-[#0f3460]/60 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="bg-[#0f3460]/60 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password rules */}
          {form.password.length > 0 && (
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <p className="text-xs text-slate-400 font-medium mb-2">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1.5">
                <PasswordRule met={passwordRules.length} label="Min 6 chars" />
                <PasswordRule met={passwordRules.uppercase} label="Uppercase" />
                <PasswordRule met={passwordRules.lowercase} label="Lowercase" />
                <PasswordRule met={passwordRules.number} label="Number" />
              </div>
            </div>
          )}

          {/* Profile picture */}
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-sm">
              Profile Picture{" "}<span className="text-slate-600">(optional)</span>
            </Label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="flex-1 h-11 flex items-center px-3 rounded-lg bg-[#0f3460]/60 border border-white/10 border-dashed group-hover:border-blue-500/50 transition-colors">
                <span className="text-sm text-slate-500 truncate">
                  {profilePicture ? profilePicture.name : "Choose image…"}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !passwordValid}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Sign in link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}