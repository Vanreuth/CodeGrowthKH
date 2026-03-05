"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuthContext } from "@/context/AuthContext"
import { authService } from "@/services/authService"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const { login } = useAuthContext()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [username, setUsername]             = useState("")
  const [password, setPassword]             = useState("")
  const [showPassword, setShowPassword]     = useState(false)
  const [rememberMe, setRememberMe]         = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [loading, setLoading]               = useState(false)
  const [googleLoading, setGoogleLoading]   = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)

  // ── Form submit ─────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const userData = await login(username, password)
      const isAdmin =
        userData.roles?.includes("ADMIN") ||
        userData.roles?.includes("ROLE_ADMIN") ||
        userData.role === "ROLE_ADMIN"
      if (isAdmin) {
        router.replace("/dashboard")
      } else {
        const returnUrl = searchParams.get("returnUrl") || "/account"
        router.replace(returnUrl)
      }
    } catch {
      setError("Invalid username or password")
    } finally {
      setLoading(false)
    }
  }

  // ── OAuth ───────────────────────────────────────────────────
  async function handleOAuth(
    provider: "google" | "facebook",
    setProviderLoading: (v: boolean) => void
  ) {
    try {
      setProviderLoading(true)
      const url = await authService.getOAuthUrl(provider)
      window.location.href = url
    } catch {
      setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed`)
      setProviderLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-[#16213e] border border-white/10 rounded-2xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Welcome Back</h1>
          <p className="text-sm text-slate-400 mt-1.5">Sign in to continue learning</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username / email */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-slate-300 text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="bg-[#0f3460]/60 border-white/10 text-white placeholder:text-slate-500
                         focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-[#0f3460]/60 border-white/10 text-white placeholder:text-slate-500
                           focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                           hover:text-slate-200 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
            <Label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">
              Remember me
            </Label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold
                       rounded-lg transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500 tracking-wide">Or continue with</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* OAuth buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth("google", setGoogleLoading)}
            disabled={googleLoading || facebookLoading}
            className="h-10 bg-transparent border-white/10 text-slate-300
                       hover:bg-white/5 hover:text-white transition-colors"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="h-4 w-4 mr-2 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth("facebook", setFacebookLoading)}
            disabled={googleLoading || facebookLoading}
            className="h-10 bg-transparent border-white/10 text-slate-300
                       hover:bg-white/5 hover:text-white transition-colors"
          >
            {facebookLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="h-4 w-4 mr-2 shrink-0 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </>
            )}
          </Button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}