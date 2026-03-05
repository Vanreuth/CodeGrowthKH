'use client'

import { useState }    from 'react'
import Link            from 'next/link'
import { useRouter }   from 'next/navigation'
import { authService } from '@/services/authService'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import { Label }   from '@/components/ui/label'

export default function RegisterPage() {
  const router = useRouter()

  const [username,  setUsername]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authService.register({ username, email, password })
      router.push('/login?registered=true')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      setError(msg ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-[#16213e] border border-white/10 rounded-2xl p-8 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">Create Account</h1>
          <p className="text-sm text-slate-400 mt-1.5">Start your learning journey</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-slate-300 text-sm font-medium">Username</Label>
            <Input
              id="username" type="text" placeholder="Choose a username"
              value={username} onChange={(e) => setUsername(e.target.value)}
              required autoComplete="username"
              className="bg-[#0f3460]/60 border-white/10 text-white placeholder:text-slate-500 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email</Label>
            <Input
              id="email" type="email" placeholder="Enter your email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
              className="bg-[#0f3460]/60 border-white/10 text-white placeholder:text-slate-500 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password" type={showPass ? 'text' : 'password'}
                placeholder="Create a password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                required autoComplete="new-password" minLength={6}
                className="bg-[#0f3460]/60 border-white/10 text-white placeholder:text-slate-500 h-11 pr-10"
              />
              <button
                type="button" onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit" disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 mt-2"
          >
            {loading
              ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating account...</span>
              : 'Create Account'
            }
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}