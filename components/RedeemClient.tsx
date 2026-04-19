'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLang } from '@/lib/providers'
import BlockchainBadge from './BlockchainBadge'
import { Ticket, Phone, CheckCircle, AlertCircle, Shield, Loader } from 'lucide-react'

interface TokenInfo {
  code: string
  status: 'PENDING' | 'REDEEMED' | 'EXPIRED'
  totalAmount: number
  totalBottles: number
  blockchainHash: string | null
  createdAt: string
  expiresAt: string
}

export default function RedeemClient() {
  const { t } = useLang()
  const searchParams = useSearchParams()
  const [tokenCode, setTokenCode] = useState(searchParams.get('token') || '')
  const [phone,     setPhone]     = useState('')
  const [info,      setInfo]      = useState<TokenInfo | null>(null)
  const [checking,  setChecking]  = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  // Auto-check if token from URL
  useEffect(() => {
    const t = searchParams.get('token')
    if (t) { setTokenCode(t); checkToken(t) }
  }, []) // eslint-disable-line

  const checkToken = async (code?: string) => {
    const c = code || tokenCode
    if (!c.trim()) return
    setChecking(true); setError(''); setInfo(null)

    const res  = await fetch(`/api/tokens/check?code=${encodeURIComponent(c.trim())}`)
    const data = await res.json()
    setChecking(false)

    if (!res.ok) setError(data.error || 'Token not found.')
    else setInfo(data.token)
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!info || info.status !== 'PENDING') return
    setRedeeming(true); setError('')

    const res  = await fetch('/api/tokens/redeem', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code: tokenCode, phone }),
    })
    const data = await res.json()
    setRedeeming(false)

    if (!res.ok) setError(data.error || 'Redemption failed.')
    else setSuccess(true)
  }

  // ── Success view ──
  if (success && info) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-md mx-auto panel text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(46,125,50,0.1)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: 'var(--eco-primary)' }} />
          </div>
          <h2 className="text-2xl font-black mb-1">Redeemed!</h2>
          <p className="opacity-65 text-sm mb-6">Your refund has been processed.</p>
          <div className="p-4 rounded-xl mb-4 text-3xl font-black" style={{
            background: 'rgba(46,125,50,0.08)', border: '1px solid rgba(46,125,50,0.2)', color: 'var(--eco-primary)'
          }}>
            ৳{info.totalAmount}
          </div>
          <div className="flex justify-center mb-6">
            <BlockchainBadge hash={info.blockchainHash} size="md" />
          </div>
          <p className="text-sm opacity-60">Transaction recorded on blockchain. This redemption cannot be altered or duplicated.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Page hero */}
      <div className="py-10 px-4" style={{
        background: 'radial-gradient(720px 380px at 10% 0%, rgba(102,187,106,0.18), transparent 60%), linear-gradient(180deg, rgba(242,242,242,0.9), rgba(255,255,255,1))',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow mb-3">
            <Ticket className="w-4 h-4" />
            Fast and clear
          </div>
          <h1 className="text-4xl font-black mb-2" style={{ letterSpacing: '-0.03em' }}>{t('redeemTitle')}</h1>
          <p className="opacity-75">{t('redeemSubtitle')}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Form panel */}
          <div className="panel">
            <h2 className="text-xl font-black mb-1">{t('tokenDetails')}</h2>
            <p className="text-sm opacity-60 mb-6">Enter your token code to redeem.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
                style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleRedeem} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">{t('token')}</label>
                <input
                  className="eco-input"
                  value={tokenCode}
                  onChange={e => setTokenCode(e.target.value)}
                  placeholder={t('tokenPlaceholder')}
                  required
                />
                <p className="text-xs opacity-50 mt-1">{t('tokenHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  <Phone className="w-3.5 h-3.5 inline mr-1" />
                  {t('mobileNumber')}
                </label>
                <input
                  className="eco-input"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => checkToken()}
                  disabled={checking}
                  className="btn-outline-eco flex-1 justify-center py-2.5"
                >
                  {checking ? <Loader className="w-4 h-4 animate-spin" /> : t('checkStatus')}
                </button>
                <button
                  type="submit"
                  disabled={redeeming || !info || info.status !== 'PENDING'}
                  className="btn-eco flex-1 justify-center py-2.5 disabled:opacity-50"
                >
                  {redeeming ? <Loader className="w-4 h-4 animate-spin" /> : t('redeemNow')}
                </button>
              </div>
            </form>
          </div>

          {/* Token info panel */}
          <div className="panel flex flex-col gap-4">
            {!info ? (
              <div className="flex-1 flex items-center justify-center text-center opacity-40 py-8">
                <div>
                  <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">Enter a token code and click "Check status"</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg">Token Info</h3>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    info.status === 'PENDING'  ? 'text-amber-700 bg-amber-50 dark:bg-amber-900/20'  :
                    info.status === 'REDEEMED' ? 'text-green-700 bg-green-50 dark:bg-green-900/20' :
                                                 'text-red-600 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    {info.status === 'PENDING' ? t('pending') : info.status === 'REDEEMED' ? t('redeemed') : t('expired')}
                  </div>
                </div>

                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.15)' }}>
                  <div className="font-mono font-black text-xl" style={{ color: 'var(--eco-primary)' }}>{info.code}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Refund value',  value: `৳${info.totalAmount}` },
                    { label: 'Bottles',        value: info.totalBottles },
                    { label: 'Created',        value: new Date(info.createdAt).toLocaleDateString() },
                    { label: 'Expires',        value: new Date(info.expiresAt).toLocaleDateString() },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)' }}>
                      <div className="text-xs opacity-55 font-semibold">{item.label}</div>
                      <div className="font-bold mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.15)' }}>
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--eco-primary)' }} />
                  <div>
                    <div className="text-xs font-bold mb-1" style={{ color: 'var(--eco-primary)' }}>Blockchain Record</div>
                    <BlockchainBadge hash={info.blockchainHash} />
                  </div>
                </div>

                {info.status === 'REDEEMED' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                    style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a' }}>
                    <CheckCircle className="w-4 h-4" />
                    This token has already been redeemed.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
