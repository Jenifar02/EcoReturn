'use client'

/**
 * components/DashboardClient.tsx — UPDATED
 * Shows codePrefix (e.g. "ECO-7K***") instead of full code.
 * Full code was never stored — this is by design.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/providers'
import BlockchainBadge from './BlockchainBadge'
import {
  Recycle, Coins, Zap, Clock, CheckCircle, XCircle,
  ArrowRight, Shield, TrendingUp, Lock
} from 'lucide-react'

interface Token {
  id:             string
  codePrefix:     string   // e.g. "ECO-7K" — safe to show
  totalBottles:   number
  totalAmount:    number
  status:         'PENDING' | 'REDEEMED' | 'EXPIRED'
  blockchainHash: string | null
  createdAt:      string
  expiresAt:      string
}

const STATUS_CONFIG = {
  PENDING:  { label: 'Pending',  color: '#f57c00', bg: 'rgba(245,124,0,0.1)',   icon: Clock },
  REDEEMED: { label: 'Redeemed', color: '#2e7d32', bg: 'rgba(46,125,50,0.1)',   icon: CheckCircle },
  EXPIRED:  { label: 'Expired',  color: '#c62828', bg: 'rgba(198,40,40,0.1)',   icon: XCircle },
}

export default function DashboardClient() {
  const { t }                       = useLang()
  const { data: session, status }   = useSession()
  const router                      = useRouter()
  const [tokens, setTokens]         = useState<Token[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/tokens')
      .then(r => r.json())
      .then(d => { setTokens(d.tokens || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center opacity-60">
          <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: 'rgba(46,125,50,0.2)', borderTopColor: 'var(--eco-primary)' }} />
          <p className="font-semibold">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const totalEarned   = tokens.filter(t => t.status === 'REDEEMED').reduce((s, t) => s + t.totalAmount, 0)
  const totalBottles  = tokens.reduce((s, t) => s + t.totalBottles, 0)
  const pendingTokens = tokens.filter(t => t.status === 'PENDING').length
  const verifiedCount = tokens.filter(t => t.blockchainHash).length

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--eco-bg)' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{t('dashTitle')}</h1>
          <p className="text-sm opacity-60 mt-1">
            স্বাগতম, {(session?.user as any)?.name}
          </p>
        </div>

        {/* Security notice */}
        <div className="flex items-center gap-3 p-3 rounded-xl text-sm" style={{ background: 'rgba(46,125,50,0.06)' }}>
          <Lock className="w-4 h-4 shrink-0" style={{ color: 'var(--eco-primary)' }} />
          <p className="opacity-70">
            Token code encrypted। শুধু আপনি জানেন। <span className="font-semibold">Full code এখানে দেখানো হয় না</span> — এটাই security।
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'মোট আয়',       value: `৳${totalEarned}`,   icon: Coins,    color: 'var(--eco-accent)' },
            { label: 'মোট Bottle',    value: totalBottles,         icon: Recycle,  color: 'var(--eco-primary)' },
            { label: 'Pending Token', value: pendingTokens,        icon: Clock,    color: '#f57c00' },
            { label: 'Verified',      value: verifiedCount,        icon: Shield,   color: '#1565c0' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl p-4 shadow-sm" style={{ background: 'var(--eco-card)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" style={{ color }} />
                <p className="text-xs opacity-60">{label}</p>
              </div>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link href="/scan" className="flex-1 py-3 rounded-xl font-semibold text-white text-center flex items-center justify-center gap-2"
            style={{ background: 'var(--eco-primary)' }}>
            <Zap className="w-4 h-4" /> Scan করুন
          </Link>
          <Link href="/redeem" className="flex-1 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2 border"
            style={{ borderColor: 'var(--eco-primary)', color: 'var(--eco-primary)' }}>
            <Coins className="w-4 h-4" /> Redeem
          </Link>
        </div>

        {/* Token list */}
        <div>
          <h2 className="font-bold mb-3 opacity-70 text-sm uppercase tracking-wide">আপনার Tokens</h2>
          {tokens.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--eco-card)' }}>
              <Recycle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold opacity-50">{t('noTokens')}</p>
              <Link href="/scan" className="inline-block mt-4 text-sm font-semibold" style={{ color: 'var(--eco-primary)' }}>
                প্রথম Bottle Scan করুন →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map(token => {
                const cfg = STATUS_CONFIG[token.status]
                const Icon = cfg.icon
                const isExpired = token.status === 'EXPIRED'

                return (
                  <div key={token.id} className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--eco-card)', opacity: isExpired ? 0.7 : 1 }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {/* Show prefix only — full code never stored */}
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-lg">{token.codePrefix}<span className="opacity-30">***</span></p>
                          <Lock className="w-3 h-3 opacity-30" />
                        </div>
                        <p className="text-xs opacity-50 mt-0.5">
                          {token.totalBottles}টি bottle · {new Date(token.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold" style={{ color: 'var(--eco-accent)' }}>৳{token.totalAmount}</p>
                      {token.status === 'PENDING' && (
                        <p className="text-xs opacity-50">
                          মেয়াদ: {new Date(token.expiresAt).toLocaleDateString('bn-BD')}
                        </p>
                      )}
                    </div>

                    {token.blockchainHash && (
                      <div className="mt-3">
                        <BlockchainBadge hash={token.blockchainHash} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
