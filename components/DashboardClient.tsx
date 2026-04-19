'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/providers'
import BlockchainBadge from './BlockchainBadge'
import {
  Recycle, Coins, Zap, Clock, CheckCircle, XCircle,
  ArrowRight, Shield, TrendingUp
} from 'lucide-react'

interface Token {
  id: string
  code: string
  totalBottles: number
  totalAmount: number
  status: 'PENDING' | 'REDEEMED' | 'EXPIRED'
  blockchainHash: string | null
  createdAt: string
  expiresAt: string
}

export default function DashboardClient() {
  const { t } = useLang()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)

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

  const statusConfig = {
    PENDING:  { label: t('pending'),  icon: Clock,         color: '#d97706', bg: 'rgba(217,119,6,0.08)'  },
    REDEEMED: { label: t('redeemed'), icon: CheckCircle,   color: '#16a34a', bg: 'rgba(22,163,74,0.08)'  },
    EXPIRED:  { label: t('expired'),  icon: XCircle,       color: '#dc2626', bg: 'rgba(220,38,38,0.08)'  },
  }

  return (
    <>
      {/* Hero */}
      <div className="py-10 px-4" style={{
        background: 'radial-gradient(720px 380px at 10% 0%, rgba(102,187,106,0.18), transparent 60%), linear-gradient(180deg, rgba(242,242,242,0.9), rgba(255,255,255,1))',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="eyebrow mb-3">
              <Shield className="w-4 h-4" />
              Blockchain Secured
            </div>
            <h1 className="text-4xl font-black mb-1" style={{ letterSpacing: '-0.03em' }}>
              {t('myDashboard')}
            </h1>
            <p className="opacity-65">Welcome back, <strong>{session?.user?.name}</strong></p>
          </div>
          <Link href="/scan" className="btn-eco px-6 py-3">
            <Zap className="w-4 h-4" />
            Scan Bottles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('totalEarned'),    value: `৳${totalEarned}`,    icon: Coins,    color: '#2e7d32' },
            { label: t('bottlesReturned'),value: totalBottles,          icon: Recycle,  color: '#0ea5e9' },
            { label: t('tokensGenerated'),value: tokens.length,         icon: Zap,      color: '#7c3aed' },
            { label: t('blockchainVerified'), value: verifiedCount,     icon: Shield,   color: '#16a34a' },
          ].map(s => (
            <div key={s.label} className="panel flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-60 font-semibold">{s.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: s.color + '18' }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-3xl font-black" style={{ letterSpacing: '-0.02em', color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tokens list */}
        <div className="panel">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black">{t('recentActivity')}</h2>
              <p className="text-sm opacity-60 mt-0.5">Your last {tokens.length} tokens</p>
            </div>
            <TrendingUp className="w-5 h-5 opacity-40" />
          </div>

          {tokens.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <Recycle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No tokens yet</p>
              <p className="text-sm mt-1">Start by scanning some bottles!</p>
              <Link href="/scan" className="btn-eco inline-flex mt-4">
                Scan bottles
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tokens.map(tok => {
                const cfg = statusConfig[tok.status]
                const StatusIcon = cfg.icon
                return (
                  <div key={tok.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(46,125,50,0.08)' }}>
                          <span className="font-mono font-black text-xs" style={{ color: 'var(--eco-primary)' }}>
                            ECO
                          </span>
                        </div>
                        <div>
                          <div className="font-mono font-black text-base" style={{ color: 'var(--eco-primary)' }}>
                            {tok.code}
                          </div>
                          <div className="text-sm opacity-60 mt-0.5">
                            {tok.totalBottles} bottles • ৳{tok.totalAmount}
                          </div>
                          <div className="mt-1.5">
                            <BlockchainBadge hash={tok.blockchainHash} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </div>
                        <div className="text-xs opacity-50">
                          {new Date(tok.createdAt).toLocaleDateString()}
                        </div>
                        {tok.status === 'PENDING' && (
                          <Link href={`/redeem?token=${tok.code}`}
                            className="text-xs font-bold no-underline hover:underline"
                            style={{ color: 'var(--eco-primary)' }}>
                            Redeem →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pending CTA */}
        {pendingTokens > 0 && (
          <div className="cta-banner flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-black">You have {pendingTokens} pending token{pendingTokens > 1 ? 's' : ''}!</h3>
              <p className="text-sm opacity-85 mt-0.5">Redeem them before they expire.</p>
            </div>
            <Link href="/redeem" className="flex items-center gap-2 bg-white font-bold px-5 py-2.5 rounded-full text-sm no-underline hover:bg-gray-50 transition"
              style={{ color: 'var(--eco-primary)' }}>
              {t('redeemToken')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
