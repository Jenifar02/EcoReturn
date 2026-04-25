'use client'

/**
 * components/ShopPanelClient.tsx
 * Shop Owner Panel — Registration, Token Verify, Redeem, History
 * Tabs: Register | Verify Token | Redeem | History
 */

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import BlockchainBadge from './BlockchainBadge'
import {
  Store, Search, CheckCircle, XCircle, Clock, Coins,
  History, ArrowRight, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight, Smartphone,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────
interface ShopProfile {
  id: string; shopName: string; area: string; district: string
  phone: string; status: 'PENDING' | 'APPROVED' | 'SUSPENDED'
  approvedAt: string | null; createdAt: string
}

interface TokenInfo {
  codePrefix: string; status: string; totalAmount: number
  totalBottles: number; blockchainHash: string | null
  createdAt: string; expiresAt: string
}

interface RedemptionRow {
  id: string; amount: number; method: string; redeemedAt: string
  blockchainHash: string | null
  user: { name: string; phone: string | null }
  token: { totalBottles: number; codePrefix: string } | null
}

// ── Status config ────────────────────────────────────────────────────────
const SHOP_STATUS = {
  PENDING:   { label: 'অনুমোদন অপেক্ষায়', color: '#f57c00', bg: 'rgba(245,124,0,0.08)', icon: Clock },
  APPROVED:  { label: 'অনুমোদিত',          color: '#2e7d32', bg: 'rgba(46,125,50,0.08)',  icon: CheckCircle },
  SUSPENDED: { label: 'স্থগিত',             color: '#c62828', bg: 'rgba(198,40,40,0.08)',  icon: XCircle },
}

// ────────────────────────────────────────────────────────────────────────
export default function ShopPanelClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = (session?.user as any)?.role

  const [tab, setTab] = useState<'register' | 'verify' | 'redeem' | 'history'>('register')
  const [shop, setShop]                 = useState<ShopProfile | null>(null)
  const [shopLoading, setShopLoading]   = useState(true)
  const [totalProcessed, setTotalProcessed] = useState(0)
  const [totalRedemptions, setTotalRedemptions] = useState(0)

  // register form
  const [form, setForm] = useState({ shopName: '', area: '', district: '', phone: '' })
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerMsg, setRegisterMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // verify
  const [verifyCode, setVerifyCode]     = useState('')
  const [verifyResult, setVerifyResult] = useState<TokenInfo | null>(null)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError]   = useState('')

  // redeem
  const [redeemCode, setRedeemCode]     = useState('')
  const [redeemMethod, setRedeemMethod] = useState<'cash' | 'bkash' | 'nagad'>('cash')
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemResult, setRedeemResult] = useState<any>(null)
  const [redeemError, setRedeemError]   = useState('')

  // history
  const [history, setHistory]   = useState<RedemptionRow[]>([])
  const [histTotal, setHistTotal] = useState(0)
  const [histPage, setHistPage] = useState(1)
  const [histLoading, setHistLoading] = useState(false)

  // ── Auth guard ───────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // ── Load shop profile ────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setShopLoading(true)
    try {
      const r = await fetch('/api/shop/profile')
      const d = await r.json()
      if (d.shop) {
        setShop(d.shop)
        setTotalProcessed(d.totalAmountProcessed)
        setTotalRedemptions(d.totalRedemptions)
        // If approved, show verify tab by default
        if (d.shop.status === 'APPROVED') setTab('verify')
      }
    } finally {
      setShopLoading(false)
    }
  }, [])

  useEffect(() => { if (status === 'authenticated') loadProfile() }, [status, loadProfile])

  // ── Load history ─────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (!shop || shop.status !== 'APPROVED') return
    setHistLoading(true)
    try {
      const r = await fetch(`/api/shop/history?page=${histPage}`)
      const d = await r.json()
      setHistory(d.redemptions ?? [])
      setHistTotal(d.total ?? 0)
    } finally {
      setHistLoading(false)
    }
  }, [shop, histPage])

  useEffect(() => { if (tab === 'history') loadHistory() }, [tab, loadHistory])

  // ── Register shop ────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!form.shopName || !form.area || !form.district || !form.phone) {
      setRegisterMsg({ type: 'err', text: 'সব ঘর পূরণ করুন।' })
      return
    }
    setRegisterLoading(true)
    setRegisterMsg(null)
    try {
      const r = await fetch('/api/shop/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (r.ok) {
        setRegisterMsg({ type: 'ok', text: d.message })
        loadProfile()
      } else {
        setRegisterMsg({ type: 'err', text: d.error })
      }
    } finally {
      setRegisterLoading(false)
    }
  }

  // ── Verify token ─────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!verifyCode.trim()) return
    setVerifyLoading(true)
    setVerifyResult(null)
    setVerifyError('')
    try {
      const r = await fetch(`/api/tokens/check?code=${encodeURIComponent(verifyCode.trim())}`)
      const d = await r.json()
      if (r.ok && d.token) {
        setVerifyResult(d.token)
      } else {
        setVerifyError(d.error ?? 'Token পাওয়া যায়নি।')
      }
    } finally {
      setVerifyLoading(false)
    }
  }

  // ── Redeem token ─────────────────────────────────────────────────────
  const handleRedeem = async () => {
    if (!redeemCode.trim()) return
    setRedeemLoading(true)
    setRedeemResult(null)
    setRedeemError('')
    try {
      const r = await fetch('/api/tokens/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode.trim(), method: redeemMethod }),
      })
      const d = await r.json()
      if (r.ok) {
        setRedeemResult(d)
        setRedeemCode('')
        loadHistory()
        loadProfile()
      } else {
        setRedeemError(d.error ?? 'Redeem ব্যর্থ হয়েছে।')
      }
    } finally {
      setRedeemLoading(false)
    }
  }

  if (status === 'loading' || shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center opacity-60">
          <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: 'rgba(46,125,50,0.2)', borderTopColor: 'var(--eco-primary)' }} />
          <p className="font-semibold text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  const isApproved = shop?.status === 'APPROVED'
  const LIMIT = 20

  const TABS = [
    { key: 'register', label: 'নিবন্ধন',      icon: Store },
    { key: 'verify',   label: 'Token যাচাই',  icon: Search,   disabled: !isApproved },
    { key: 'redeem',   label: 'Redeem',        icon: Coins,    disabled: !isApproved },
    { key: 'history',  label: 'ইতিহাস',        icon: History,  disabled: !isApproved },
  ] as const

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--eco-bg, #f2f2f2)' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--eco-primary)' }}>
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Shop Owner Panel</h1>
            <p className="text-xs opacity-50">{shop?.shopName ?? 'নতুন Shop নিবন্ধন'}</p>
          </div>
        </div>

        {/* Shop status banner */}
        {shop && (() => {
          const cfg  = SHOP_STATUS[shop.status]
          const Icon = cfg.icon
          return (
            <div className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
              <Icon className="w-5 h-5 shrink-0" style={{ color: cfg.color }} />
              <div>
                <p className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</p>
                {shop.status === 'PENDING' && (
                  <p className="text-xs opacity-70 mt-0.5">Admin অনুমোদনের জন্য অপেক্ষা করুন। সাধারণত ২৪ ঘণ্টার মধ্যে হয়।</p>
                )}
                {shop.status === 'APPROVED' && (
                  <p className="text-xs opacity-70 mt-0.5">
                    আজ পর্যন্ত ৳{totalProcessed.toFixed(0)} process হয়েছে · {totalRedemptions}টি redemption
                  </p>
                )}
                {shop.status === 'SUSPENDED' && (
                  <p className="text-xs opacity-70 mt-0.5">আপনার Shop স্থগিত করা হয়েছে। Admin-এর সাথে যোগাযোগ করুন।</p>
                )}
              </div>
            </div>
          )
        })()}

        {/* Tab nav */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl"
          style={{ background: 'var(--eco-card, white)' }}>
          {TABS.map(({ key, label, icon: Icon, disabled }) => (
            <button key={key}
              onClick={() => !disabled && setTab(key as any)}
              disabled={!!disabled}
              className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={tab === key
                ? { background: 'var(--eco-primary)', color: '#fff' }
                : { color: 'inherit', opacity: disabled ? 0.3 : 0.6 }}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── REGISTER TAB ─────────────────────────────────────────── */}
        {tab === 'register' && (
          <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ background: 'var(--eco-card, white)' }}>
            {shop ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle className="w-12 h-12 mx-auto" style={{ color: 'var(--eco-primary)' }} />
                <p className="font-bold text-lg">{shop.shopName}</p>
                <p className="text-sm opacity-60">{shop.area}, {shop.district}</p>
                <p className="text-sm opacity-60">{shop.phone}</p>
                <p className="text-xs opacity-40 mt-2">নিবন্ধন তারিখ: {new Date(shop.createdAt).toLocaleDateString('bn-BD')}</p>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-lg">Shop নিবন্ধন করুন</h2>
                <p className="text-sm opacity-60">আপনার shop-এর তথ্য দিন। Admin অনুমোদনের পরে token redeem করতে পারবেন।</p>

                <div className="space-y-3">
                  {([
                    { key: 'shopName', label: 'Shop নাম', placeholder: 'যেমন: গ্রীন স্টোর ঢাকা' },
                    { key: 'area',     label: 'এলাকা',    placeholder: 'যেমন: মিরপুর ১০' },
                    { key: 'district', label: 'জেলা',     placeholder: 'যেমন: ঢাকা' },
                    { key: 'phone',    label: 'ফোন',      placeholder: '01XXXXXXXXX' },
                  ] as const).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold opacity-60 mb-1">{label}</label>
                      <input
                        type={key === 'phone' ? 'tel' : 'text'}
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm"
                        style={{ background: 'var(--eco-bg, #f2f2f2)', borderColor: 'var(--border, rgba(0,0,0,0.12))' }}
                      />
                    </div>
                  ))}
                </div>

                {registerMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${registerMsg.type === 'ok' ? 'text-green-700' : 'text-red-700'}`}
                    style={{ background: registerMsg.type === 'ok' ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)' }}>
                    {registerMsg.type === 'ok' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {registerMsg.text}
                  </div>
                )}

                <button onClick={handleRegister} disabled={registerLoading}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'var(--eco-primary)' }}>
                  {registerLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                  {registerLoading ? 'পাঠানো হচ্ছে…' : 'নিবন্ধন করুন'}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── VERIFY TAB ───────────────────────────────────────────── */}
        {tab === 'verify' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--eco-card, white)' }}>
              <h2 className="font-bold mb-1">Token যাচাই করুন</h2>
              <p className="text-sm opacity-60 mb-4">Customer-এর Token Code দিয়ে যাচাই করুন। Redeem হবে না।</p>

              <div className="flex gap-2">
                <input type="text" placeholder="ECO-XXXXXXXX"
                  value={verifyCode}
                  onChange={e => { setVerifyCode(e.target.value.toUpperCase()); setVerifyResult(null); setVerifyError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono"
                  style={{ background: 'var(--eco-bg, #f2f2f2)', borderColor: 'var(--border, rgba(0,0,0,0.12))' }}
                />
                <button onClick={handleVerify} disabled={verifyLoading || !verifyCode.trim()}
                  className="px-4 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 disabled:opacity-50"
                  style={{ background: 'var(--eco-primary)' }}>
                  {verifyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  যাচাই
                </button>
              </div>

              {verifyError && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl text-sm text-red-700"
                  style={{ background: 'rgba(198,40,40,0.08)' }}>
                  <XCircle className="w-4 h-4 shrink-0" />{verifyError}
                </div>
              )}

              {verifyResult && (() => {
                const isValid = verifyResult.status === 'PENDING' && new Date(verifyResult.expiresAt) > new Date()
                return (
                  <div className="mt-4 p-4 rounded-xl space-y-3"
                    style={{ background: isValid ? 'rgba(46,125,50,0.06)' : 'rgba(198,40,40,0.06)',
                             border: `1px solid ${isValid ? 'rgba(46,125,50,0.2)' : 'rgba(198,40,40,0.2)'}` }}>
                    <div className="flex items-center gap-2">
                      {isValid
                        ? <CheckCircle className="w-5 h-5" style={{ color: '#2e7d32' }} />
                        : <XCircle className="w-5 h-5" style={{ color: '#c62828' }} />}
                      <p className="font-bold" style={{ color: isValid ? '#2e7d32' : '#c62828' }}>
                        {isValid ? 'Valid Token ✓' : `Invalid: ${verifyResult.status}`}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><p className="opacity-50 text-xs">পরিমাণ</p><p className="font-bold text-lg">৳{verifyResult.totalAmount}</p></div>
                      <div><p className="opacity-50 text-xs">Bottles</p><p className="font-bold text-lg">{verifyResult.totalBottles}টি</p></div>
                      <div><p className="opacity-50 text-xs">Token Prefix</p><p className="font-mono font-semibold">{verifyResult.codePrefix}***</p></div>
                      <div><p className="opacity-50 text-xs">মেয়াদ</p><p className="font-semibold text-sm">{new Date(verifyResult.expiresAt).toLocaleDateString('bn-BD')}</p></div>
                    </div>
                    {verifyResult.blockchainHash && <BlockchainBadge hash={verifyResult.blockchainHash} />}
                    {isValid && (
                      <button onClick={() => { setTab('redeem'); setRedeemCode(verifyCode) }}
                        className="w-full py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                        style={{ background: 'var(--eco-primary)' }}>
                        Redeem করুন <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* ── REDEEM TAB ───────────────────────────────────────────── */}
        {tab === 'redeem' && (
          <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ background: 'var(--eco-card, white)' }}>
            <h2 className="font-bold">Token Redeem করুন</h2>
            <p className="text-sm opacity-60">Customer-এর Token Code এবং payment method দিন।</p>

            <div>
              <label className="block text-xs font-semibold opacity-60 mb-1">Token Code</label>
              <input type="text" placeholder="ECO-XXXXXXXX"
                value={redeemCode}
                onChange={e => { setRedeemCode(e.target.value.toUpperCase()); setRedeemResult(null); setRedeemError('') }}
                className="w-full px-4 py-2.5 rounded-xl border text-sm font-mono"
                style={{ background: 'var(--eco-bg, #f2f2f2)', borderColor: 'var(--border, rgba(0,0,0,0.12))' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-60 mb-2">Payment Method</label>
              <div className="flex gap-2">
                {(['cash', 'bkash', 'nagad'] as const).map(m => (
                  <button key={m} onClick={() => setRedeemMethod(m)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold capitalize border transition-all"
                    style={redeemMethod === m
                      ? { background: 'var(--eco-primary)', color: '#fff', borderColor: 'var(--eco-primary)' }
                      : { borderColor: 'var(--border, rgba(0,0,0,0.12))' }}>
                    {m === 'cash' ? '💵 নগদ' : m === 'bkash' ? '📱 bKash' : '📱 Nagad'}
                  </button>
                ))}
              </div>
            </div>

            {redeemError && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-700"
                style={{ background: 'rgba(198,40,40,0.08)' }}>
                <AlertCircle className="w-4 h-4 shrink-0" />{redeemError}
              </div>
            )}

            {redeemResult && (
              <div className="p-4 rounded-xl space-y-3"
                style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.2)' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: '#2e7d32' }} />
                  <p className="font-bold" style={{ color: '#2e7d32' }}>{redeemResult.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="opacity-50 text-xs">Customer</p><p className="font-semibold">{redeemResult.customerName}</p></div>
                  <div><p className="opacity-50 text-xs">পরিমাণ</p><p className="font-bold text-lg">৳{redeemResult.amount}</p></div>
                  <div><p className="opacity-50 text-xs">Bottles</p><p className="font-semibold">{redeemResult.totalBottles}টি</p></div>
                </div>
                {redeemResult.blockchainHash && <BlockchainBadge hash={redeemResult.blockchainHash} />}
              </div>
            )}

            <button onClick={handleRedeem} disabled={redeemLoading || !redeemCode.trim()}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--eco-primary)' }}>
              {redeemLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
              {redeemLoading ? 'প্রক্রিয়া হচ্ছে…' : 'Redeem নিশ্চিত করুন'}
            </button>
          </div>
        )}

        {/* ── HISTORY TAB ──────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: 'var(--eco-card, white)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border, rgba(0,0,0,0.08))' }}>
              <div>
                <h2 className="font-bold">Redemption ইতিহাস</h2>
                <p className="text-xs opacity-50 mt-0.5">মোট {histTotal}টি transaction</p>
              </div>
              {histLoading && <RefreshCw className="w-4 h-4 animate-spin opacity-40" />}
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--border, rgba(0,0,0,0.06))' }}>
              {history.length === 0 && !histLoading && (
                <div className="px-5 py-10 text-center opacity-40 text-sm">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  কোনো ইতিহাস নেই
                </div>
              )}
              {history.map(r => (
                <div key={r.id} className="px-5 py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{r.user.name}</p>
                      <p className="text-xs opacity-50">
                        {r.token?.totalBottles ?? '?'}টি bottle · {r.method}
                        {r.token?.codePrefix && ` · ${r.token.codePrefix}***`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: 'var(--eco-primary)' }}>৳{r.amount}</p>
                      <p className="text-xs opacity-40">
                        {new Date(r.redeemedAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                  {r.blockchainHash && <BlockchainBadge hash={r.blockchainHash} />}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {histTotal > LIMIT && (
              <div className="px-5 py-3 flex items-center justify-between border-t"
                style={{ borderColor: 'var(--border, rgba(0,0,0,0.06))' }}>
                <span className="text-xs opacity-50">Page {histPage} / {Math.ceil(histTotal / LIMIT)}</span>
                <div className="flex gap-2">
                  <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={histPage === 1}
                    className="p-1.5 rounded-lg border disabled:opacity-30"
                    style={{ borderColor: 'var(--border, rgba(0,0,0,0.1))' }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setHistPage(p => p + 1)} disabled={histPage * LIMIT >= histTotal}
                    className="p-1.5 rounded-lg border disabled:opacity-30"
                    style={{ borderColor: 'var(--border, rgba(0,0,0,0.1))' }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
