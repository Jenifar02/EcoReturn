'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/providers'
import { UserPlus, Eye, EyeOff, User, Store } from 'lucide-react'

type Role = 'USER' | 'SHOP_OWNER'

export default function SignupForm() {
  const { t } = useLang()
  const router = useRouter()
  const [role, setRole] = useState<Role>('USER')
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, password: form.password, role }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Registration failed.')
    } else {
      router.push('/login?registered=1')
    }
  }

  return (
    <>
      <div className="py-10 px-4" style={{
        background: 'radial-gradient(720px 380px at 10% 0%, rgba(102,187,106,0.18), transparent 60%), linear-gradient(180deg, rgba(242,242,242,0.9), rgba(255,255,255,1))',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow mb-3">Create your account</div>
          <h1 className="text-4xl font-black mb-2" style={{ letterSpacing: '-0.03em' }}>{t('signUp')}</h1>
          <p className="opacity-75">Track your tokens, history and redemptions.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <div className="panel">
            <h2 className="text-2xl font-black mb-1" style={{ letterSpacing: '-0.02em' }}>{t('getStarted')}</h2>
            <p className="opacity-65 text-sm mb-6">Fill in your details to create a free account.</p>

            {/* ── Role Selection ── */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">আমি কে? / I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {/* USER option */}
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer"
                  style={{
                    borderColor: role === 'USER' ? 'var(--eco-primary)' : 'rgba(0,0,0,0.10)',
                    background: role === 'USER' ? 'rgba(102,187,106,0.10)' : 'var(--eco-card)',
                    boxShadow: role === 'USER' ? '0 0 0 3px rgba(102,187,106,0.15)' : 'none',
                  }}
                >
                  {role === 'USER' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ background: 'var(--eco-primary)' }}>✓</span>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: role === 'USER' ? 'rgba(102,187,106,0.2)' : 'rgba(0,0,0,0.06)' }}>
                    <User className="w-5 h-5" style={{ color: role === 'USER' ? 'var(--eco-primary)' : 'currentColor', opacity: role === 'USER' ? 1 : 0.5 }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">সাধারণ User</p>
                    <p className="text-xs opacity-55 mt-0.5 leading-snug">বোতল scan করে টাকা আয় করুন</p>
                  </div>
                </button>

                {/* SHOP_OWNER option */}
                <button
                  type="button"
                  onClick={() => setRole('SHOP_OWNER')}
                  className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer"
                  style={{
                    borderColor: role === 'SHOP_OWNER' ? 'var(--eco-primary)' : 'rgba(0,0,0,0.10)',
                    background: role === 'SHOP_OWNER' ? 'rgba(102,187,106,0.10)' : 'var(--eco-card)',
                    boxShadow: role === 'SHOP_OWNER' ? '0 0 0 3px rgba(102,187,106,0.15)' : 'none',
                  }}
                >
                  {role === 'SHOP_OWNER' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ background: 'var(--eco-primary)' }}>✓</span>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: role === 'SHOP_OWNER' ? 'rgba(102,187,106,0.2)' : 'rgba(0,0,0,0.06)' }}>
                    <Store className="w-5 h-5" style={{ color: role === 'SHOP_OWNER' ? 'var(--eco-primary)' : 'currentColor', opacity: role === 'SHOP_OWNER' ? 1 : 0.5 }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">Shop Owner</p>
                    <p className="text-xs opacity-55 mt-0.5 leading-snug">Token redeem করুন, Admin approve করবে</p>
                  </div>
                </button>
              </div>

              {/* Info banner for Shop Owner */}
              {role === 'SHOP_OWNER' && (
                <div className="mt-3 p-3 rounded-xl text-xs leading-relaxed" style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.25)', color: 'rgba(120,80,0,0.85)' }}>
                  <span className="font-bold">ℹ️ Shop Owner flow:</span> Account তৈরির পর login করলে shop registration form দেখাবে। Admin approve করলে আপনি token redeem করতে পারবেন।
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t('fullName')}</label>
                  <input className="eco-input" type="text" value={form.name} onChange={set('name')} placeholder="Your name" autoComplete="name" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t('mobileNumber')}</label>
                  <input className="eco-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" autoComplete="tel" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">{t('email')}</label>
                <input className="eco-input" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" autoComplete="email" required />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t('password')}</label>
                  <div className="relative">
                    <input
                      className="eco-input pr-10"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t('confirmPassword')}</label>
                  <input
                    className="eco-input"
                    type="password"
                    value={form.confirm}
                    onChange={set('confirm')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded" required />
                <span className="opacity-75">{t('agreeTerms')}</span>
              </label>

              <button type="submit" disabled={loading} className="btn-eco w-full justify-center py-3 text-base disabled:opacity-60">
                {loading ? t('loading') : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {t('createAccount')}
                  </>
                )}
              </button>

              <p className="text-center text-sm opacity-65">
                {t('alreadyAccount')}{' '}
                <Link href="/login" className="font-bold no-underline hover:underline" style={{ color: 'var(--eco-primary)' }}>
                  {t('signIn')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
