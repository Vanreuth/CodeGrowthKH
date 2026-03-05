'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setRoleCookie } from '@/lib/Cookies'
import { hasAdminRole } from '@/types/apiType'
import { authService } from '@/services/authService'

type Status = 'loading' | 'success' | 'error'

export default function OAuthCallbackPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [dots, setDots]       = useState('')

  // ── Animate dots ────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() =>
      setDots(d => d.length >= 3 ? '' : d + '.'), 500)
    return () => clearInterval(interval)
  }, [])

  // ── Handle redirect from Spring Boot OAuth2 ─────────────────
  useEffect(() => {
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage(decodeURIComponent(error))
      return
    }

    // Backend already set access_token + refresh_token cookies
    // Just call /me to get user data and set role cookie
    authService.me()
      .then((user) => {
        setStatus('success')
        const admin = hasAdminRole(user.roles)
        setRoleCookie(admin)

        setTimeout(() => {
          router.replace(admin ? '/dashboard' : '/account')
        }, 1200)
      })
      .catch(() => {
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
      })
  }, [])

  return (
    <div style={styles.root}>
      {/* Background grid */}
      <div style={styles.grid} />

      {/* Glow orbs */}
      <div style={{ ...styles.orb, ...styles.orb1 }} />
      <div style={{ ...styles.orb, ...styles.orb2 }} />

      <div style={styles.card}>

        {/* Google icon */}
        <div style={styles.iconWrap}>
          <svg width="32" height="32" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>

        {/* Loading state */}
        {status === 'loading' && (
          <>
            <div style={styles.spinner}>
              <div style={styles.spinnerRing} />
            </div>
            <p style={styles.title}>Signing you in{dots}</p>
            <p style={styles.subtitle}>Verifying your Google account</p>
            <div style={styles.steps}>
              {['Authenticating', 'Loading profile', 'Preparing workspace'].map((step, i) => (
                <div key={step} style={{ ...styles.step, animationDelay: `${i * 0.3}s` }}>
                  <div style={styles.stepDot} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
          <>
            <div style={styles.successIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#4ade80" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 30, strokeDashoffset: 0,
                    animation: 'draw 0.5s ease forwards' }} />
              </svg>
            </div>
            <p style={styles.title}>Welcome back!</p>
            <p style={styles.subtitle}>Redirecting to your account</p>
            <div style={styles.progressBar}>
              <div style={styles.progressFill} />
            </div>
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#f87171" strokeWidth="2.5"
                  strokeLinecap="round" />
              </svg>
            </div>
            <p style={styles.title}>Sign in failed</p>
            <p style={{ ...styles.subtitle, color: '#f87171', fontSize: 13 }}>
              {message || 'Something went wrong. Please try again.'}
            </p>
            <button style={styles.retryBtn} onClick={() => router.replace('/login')}>
              Back to login
            </button>
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1); }
        }
        @keyframes fillProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes draw {
          from { stroke-dashoffset: 30; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight      : '100vh',
    display        : 'flex',
    alignItems     : 'center',
    justifyContent : 'center',
    background     : '#080d18',
    fontFamily     : "'DM Sans', sans-serif",
    overflow       : 'hidden',
    position       : 'relative',
  },
  grid: {
    position  : 'absolute',
    inset     : 0,
    background: `
      linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
  },
  orb: {
    position     : 'absolute',
    borderRadius : '50%',
    filter       : 'blur(80px)',
    pointerEvents: 'none',
  },
  orb1: {
    width     : 400,
    height    : 400,
    background: 'rgba(66,133,244,0.12)',
    top       : '-100px',
    left      : '-100px',
    animation : 'float 8s ease-in-out infinite',
  },
  orb2: {
    width     : 300,
    height    : 300,
    background: 'rgba(52,168,83,0.08)',
    bottom    : '-80px',
    right     : '-80px',
    animation : 'float 10s ease-in-out infinite reverse',
  },
  card: {
    position      : 'relative',
    zIndex        : 10,
    width         : 360,
    background    : 'rgba(255,255,255,0.03)',
    border        : '1px solid rgba(255,255,255,0.08)',
    borderRadius  : 24,
    padding       : '48px 40px',
    display       : 'flex',
    flexDirection : 'column',
    alignItems    : 'center',
    gap           : 16,
    backdropFilter: 'blur(20px)',
    boxShadow     : '0 32px 80px rgba(0,0,0,0.4)',
    animation     : 'fadeSlideUp 0.5s ease forwards',
  },
  iconWrap: {
    width         : 56,
    height        : 56,
    borderRadius  : '50%',
    background    : 'rgba(255,255,255,0.06)',
    border        : '1px solid rgba(255,255,255,0.1)',
    display       : 'flex',
    alignItems    : 'center',
    justifyContent: 'center',
    marginBottom  : 4,
  },
  spinner: {
    position: 'relative',
    width   : 48,
    height  : 48,
  },
  spinnerRing: {
    position     : 'absolute',
    inset        : 0,
    borderRadius : '50%',
    border       : '2.5px solid rgba(255,255,255,0.08)',
    borderTop    : '2.5px solid #4285F4',
    animation    : 'spin 0.8s linear infinite',
  },
  title: {
    margin    : 0,
    fontSize  : 20,
    fontWeight: 500,
    color     : '#f1f5f9',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    margin   : 0,
    fontSize : 14,
    color    : 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  steps: {
    display      : 'flex',
    flexDirection: 'column',
    gap          : 10,
    width        : '100%',
    marginTop    : 8,
  },
  step: {
    display   : 'flex',
    alignItems: 'center',
    gap       : 10,
    fontSize  : 13,
    color     : 'rgba(255,255,255,0.35)',
    animation : 'pulse 1.5s ease-in-out infinite',
  },
  stepDot: {
    width       : 6,
    height      : 6,
    borderRadius: '50%',
    background  : '#4285F4',
    flexShrink  : 0,
  },
  successIcon: {
    width         : 56,
    height        : 56,
    borderRadius  : '50%',
    background    : 'rgba(74,222,128,0.1)',
    border        : '1px solid rgba(74,222,128,0.25)',
    display       : 'flex',
    alignItems    : 'center',
    justifyContent: 'center',
  },
  progressBar: {
    width        : '100%',
    height       : 3,
    background   : 'rgba(255,255,255,0.06)',
    borderRadius : 99,
    overflow     : 'hidden',
    marginTop    : 8,
  },
  progressFill: {
    height    : '100%',
    background: 'linear-gradient(90deg, #4285F4, #34A853)',
    borderRadius: 99,
    animation : 'fillProgress 1.2s ease forwards',
  },
  errorIcon: {
    width         : 56,
    height        : 56,
    borderRadius  : '50%',
    background    : 'rgba(248,113,113,0.1)',
    border        : '1px solid rgba(248,113,113,0.25)',
    display       : 'flex',
    alignItems    : 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    marginTop    : 8,
    padding      : '10px 28px',
    background   : 'rgba(255,255,255,0.06)',
    border       : '1px solid rgba(255,255,255,0.1)',
    borderRadius : 10,
    color        : '#f1f5f9',
    fontSize     : 14,
    fontWeight   : 500,
    cursor       : 'pointer',
    fontFamily   : "'DM Sans', sans-serif",
    transition   : 'background 0.2s',
  },
}