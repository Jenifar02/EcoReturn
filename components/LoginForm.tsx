'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useLang } from '@/lib/providers'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginForm() {
  const { t } = useLang()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <>
      {/* Page hero */}
      <div className="py-10 px-4" style={{
        background: 'radial-gradient(720px 380px at 10% 0%, rgba(102,187,106,0.18), transparent 60%), linear-gradient(180deg, rgba(242,242,242,0.9), rgba(255,255,255,1))',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow mb-3">Secure access</div>
          <h1 className="text-4xl font-black mb-2" style={{ letterSpacing: '-0.03em' }}>{t('login')}</h1>
          <p className="opacity-75">{t('loginSubtitle')}</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="panel">
            <h2 className="text-2xl font-black mb-1" style={{ letterSpacing: '-0.02em' }}>{t('welcomeBack')}</h2>
            <p className="opacity-65 text-sm mb-6">{t('loginSubtitle')}</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" htmlFor="email">{t('email')}</label>
                <input
                  className="eco-input"
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" htmlFor="password">{t('password')}</label>
                <div className="relative">
                  <input
                    className="eco-input pr-10"
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  {t('rememberMe')}
                </label>
                <Link href="#" className="text-sm font-bold no-underline hover:underline" style={{ color: 'var(--eco-primary)' }}>
                  {t('forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-eco w-full justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? t('loading') : (
                  <>
                    <LogIn className="w-4 h-4" />
                    {t('login')}
                  </>
                )}
              </button>

              <p className="text-center text-sm opacity-65">
                {t('newUser')}{' '}
                <Link href="/signup" className="font-bold no-underline hover:underline" style={{ color: 'var(--eco-primary)' }}>
                  {t('createAccount')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
