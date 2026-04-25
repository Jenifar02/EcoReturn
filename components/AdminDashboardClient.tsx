'use client'

/**
 * components/AdminDashboardClient.tsx
 * Admin Dashboard — Stats, User List, Shop Approval
 * Tabs: Overview | Users | Shops
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import BlockchainBadge from './BlockchainBadge'
import {
  Users, Store, Recycle, Coins, Clock, CheckCircle,
  XCircle, Shield, TrendingUp, Search, ChevronLeft,
  ChevronRight, RefreshCw, AlertCircle, LayoutGrid, QrCode,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────
interface Stats {
  totalUsers: number
  totalShops: number
  pendingShops: number
  totalTokens: number
  redeemedTokens: number
  totalBottles: number
  totalAmountRedeemed: number
}

interface RecentUser {
  id: string; name: string; email: string; role: string; createdAt: string
}

interface RecentRedemption {
  id: string; amount: number; method: string; redeemedAt: string
  user: { name: string }
  shopProfile: { shopName: string } | null
}

interface UserRow {
  id: string; name: string; email: string; phone: string | null
  role: string; createdAt: string
  _count: { tokens: number; scans: number }
}

interface ShopRow {
  id: string; shopName: string; area: string; district: string
  phone: string; status: 'PENDING' | 'APPROVED' | 'SUSPENDED'; createdAt: string
  user: { name: string; email: string }
  _count: { redemptions: number }
}

// ── Status badge helper ──────────────────────────────────────────────────
const SHOP_STATUS = {
  PENDING:   { label: 'Pending',   color: '#f57c00', bg: 'rgba(245,124,0,0.1)',   icon: Clock },
  APPROVED:  { label: 'Approved',  color: '#2e7d32', bg: 'rgba(46,125,50,0.1)',   icon: CheckCircle },
  SUSPENDED: { label: 'Suspended', color: '#c62828', bg: 'rgba(198,40,40,0.1)',   icon: XCircle },
}

// ────────────────────────────────────────────────────────────────────────
export default function AdminDashboardClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab]         = useState<'overview' | 'users' | 'shops'>('overview')

  // overview data
  const [stats, setStats]           = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers]       = useState<RecentUser[]>([])
  const [recentRedemptions, setRecentRedemptions] = useState<RecentRedemption[]>([])
  const [overviewLoading, setOverviewLoading] = useState(true)

  // users tab
  const [users, setUsers]         = useState<UserRow[]>([])
  const [userTotal, setUserTotal] = useState(0)
  const [userPage, setUserPage]   = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)

  // shops tab
  const [shops, setShops]         = useState<ShopRow[]>([])
  const [shopTotal, setShopTotal] = useState(0)
  const [shopPage, setShopPage]   = useState(1)
  const [shopFilter, setShopFilter] = useState('')
  const [shopsLoading, setShopsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ── Auth guard ───────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && (session.user as any).role !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  // ── Load overview ────────────────────────────────────────────────────
  const loadOverview = useCallback(async () => {
    setOverviewLoading(true)
    try {
      const r = await fetch('/api/admin/stats')
      const d = await r.json()
      setStats(d.stats)
      setRecentUsers(d.recentUsers ?? [])
      setRecentRedemptions(d.recentRedemptions ?? [])
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  useEffect(() => { if (status === 'authenticated') loadOverview() }, [status, loadOverview])

  // ── Load users ────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const r = await fetch(`/api/admin/users?page=${userPage}&q=${encodeURIComponent(userSearch)}`)
      const d = await r.json()
      setUsers(d.users ?? [])
      setUserTotal(d.total ?? 0)
    } finally {
      setUsersLoading(false)
    }
  }, [userPage, userSearch])

  useEffect(() => { if (tab === 'users') loadUsers() }, [tab, loadUsers])

  // ── Load shops ────────────────────────────────────────────────────────
  const loadShops = useCallback(async () => {
    setShopsLoading(true)
    try {
      const r = await fetch(`/api/admin/shops?page=${shopPage}${shopFilter ? `&status=${shopFilter}` : ''}`)
      const d = await r.json()
      setShops(d.shops ?? [])
      setShopTotal(d.total ?? 0)
    } finally {
      setShopsLoading(false)
    }
  }, [shopPage, shopFilter])

  useEffect(() => { if (tab === 'shops') loadShops() }, [tab, loadShops])

  // ── Shop action (approve / suspend) ───────────────────────────────────
  const handleShopAction = async (shopId: string, action: 'approve' | 'suspend' | 'pending') => {
    setActionLoading(shopId + action)
    try {
      const r = await fetch('/api/admin/shops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, action }),
      })
      if (r.ok) loadShops()
    } finally {
      setActionLoading(null)
    }
  }

  if (status === 'loading' || overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center opacity-60">
          <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: 'rgba(46,125,50,0.2)', borderTopColor: 'var(--eco-primary)' }} />
          <p className="font-semibold text-sm">Loading admin panel…</p>
        </div>
      </div>
    )
  }

  const STAT_CARDS = stats ? [
    { label: 'মোট ব্যবহারকারী', value: stats.totalUsers,            icon: Users,    color: '#1565c0' },
    { label: 'মোট Shop',        value: stats.totalShops,            icon: Store,    color: '#6a1b9a' },
    { label: 'Pending Shop',    value: stats.pendingShops,          icon: Clock,    color: '#f57c00' },
    { label: 'Total Bottles',   value: stats.totalBottles,          icon: Recycle,  color: 'var(--eco-primary)' },
    { label: 'Redeemed Tokens', value: stats.redeemedTokens,        icon: CheckCircle, color: '#2e7d32' },
    { label: 'মোট পরিশোধ (৳)',  value: `৳${stats.totalAmountRedeemed.toFixed(0)}`, icon: Coins, color: '#e65100' },
  ] : []

  const LIMIT = 20

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--eco-bg, #f2f2f2)' }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6" style={{ color: 'var(--eco-primary)' }} />
              Admin Dashboard
            </h1>
            <p className="text-sm opacity-50 mt-0.5">EcoReturn Bangladesh Control Panel</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/barcodes"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--eco-primary)' }}>
              <QrCode className="w-3.5 h-3.5" /> Barcode Generate
            </Link>
            <button onClick={loadOverview}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold"
              style={{ borderColor: 'var(--eco-primary)', color: 'var(--eco-primary)' }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--eco-card, white)' }}>
          {([
            { key: 'overview', label: 'Overview', icon: LayoutGrid },
            { key: 'users',    label: 'Users',    icon: Users },
            { key: 'shops',    label: 'Shops',    icon: Store },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={tab === key
                ? { background: 'var(--eco-primary)', color: '#fff' }
                : { color: 'inherit', opacity: 0.6 }}>
              <Icon className="w-4 h-4" />{label}
              {key === 'shops' && stats?.pendingShops ? (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full font-bold"
                  style={{ background: '#f57c00', color: '#fff' }}>
                  {stats.pendingShops}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--eco-card, white)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" style={{ color }} />
                    <p className="text-xs opacity-50">{label}</p>
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            {/* Recent users */}
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: 'var(--eco-card, white)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border, rgba(0,0,0,0.08))' }}>
                <h2 className="font-bold flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: 'var(--eco-primary)' }} />
                  সাম্প্রতিক ব্যবহারকারী
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border, rgba(0,0,0,0.06))' }}>
                {recentUsers.map(u => (
                  <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{u.name}</p>
                      <p className="text-xs opacity-50">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(46,125,50,0.1)', color: 'var(--eco-primary)' }}>
                        {u.role}
                      </span>
                      <span className="text-xs opacity-40">
                        {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent redemptions */}
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: 'var(--eco-card, white)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border, rgba(0,0,0,0.08))' }}>
                <h2 className="font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--eco-primary)' }} />
                  সাম্প্রতিক Redemption
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border, rgba(0,0,0,0.06))' }}>
                {recentRedemptions.length === 0 && (
                  <p className="px-5 py-4 text-sm opacity-40">কোনো redemption নেই</p>
                )}
                {recentRedemptions.map(r => (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{r.user.name}</p>
                      <p className="text-xs opacity-50">
                        {r.shopProfile?.shopName ?? 'Admin'} · {r.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: 'var(--eco-primary)' }}>৳{r.amount}</p>
                      <p className="text-xs opacity-40">
                        {new Date(r.redeemedAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ────────────────────────────────────────────── */}
        {tab === 'users' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input
                type="text"
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন…"
                value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setUserPage(1) }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm"
                style={{ background: 'var(--eco-card, white)', borderColor: 'var(--border, rgba(0,0,0,0.12))' }}
              />
            </div>

            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: 'var(--eco-card, white)' }}>
              <div className="px-5 py-3 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border, rgba(0,0,0,0.08))' }}>
                <span className="text-sm font-semibold opacity-60">মোট {userTotal} জন ব্যবহারকারী</span>
                {usersLoading && <RefreshCw className="w-4 h-4 animate-spin opacity-40" />}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border, rgba(0,0,0,0.06))' }}>
                      {['নাম', 'ইমেইল', 'ভূমিকা', 'Tokens', 'Bottles', 'যোগ দিয়েছেন'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold opacity-50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border, rgba(0,0,0,0.04))' }}>
                        <td className="px-4 py-3 font-semibold">{u.name}</td>
                        <td className="px-4 py-3 opacity-60 text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: u.role === 'ADMIN' ? 'rgba(198,40,40,0.1)' :
                                          u.role === 'SHOP_OWNER' ? 'rgba(106,27,154,0.1)' :
                                          'rgba(46,125,50,0.1)',
                              color: u.role === 'ADMIN' ? '#c62828' :
                                     u.role === 'SHOP_OWNER' ? '#6a1b9a' :
                                     'var(--eco-primary)',
                            }}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{u._count.tokens}</td>
                        <td className="px-4 py-3 text-center">{u._count.scans}</td>
                        <td className="px-4 py-3 opacity-50 text-xs">
                          {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3 flex items-center justify-between border-t"
                style={{ borderColor: 'var(--border, rgba(0,0,0,0.06))' }}>
                <span className="text-xs opacity-50">Page {userPage} / {Math.ceil(userTotal / LIMIT) || 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}
                    className="p-1.5 rounded-lg border disabled:opacity-30"
                    style={{ borderColor: 'var(--border, rgba(0,0,0,0.1))' }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setUserPage(p => p + 1)} disabled={userPage * LIMIT >= userTotal}
                    className="p-1.5 rounded-lg border disabled:opacity-30"
                    style={{ borderColor: 'var(--border, rgba(0,0,0,0.1))' }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SHOPS TAB ────────────────────────────────────────────── */}
        {tab === 'shops' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {['', 'PENDING', 'APPROVED', 'SUSPENDED'].map(f => (
                <button key={f} onClick={() => { setShopFilter(f); setShopPage(1) }}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold border transition-all"
                  style={shopFilter === f
                    ? { background: 'var(--eco-primary)', color: '#fff', borderColor: 'var(--eco-primary)' }
                    : { borderColor: 'var(--border, rgba(0,0,0,0.12))' }}>
                  {f || 'সব'}
                </button>
              ))}
            </div>

            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: 'var(--eco-card, white)' }}>
              <div className="px-5 py-3 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border, rgba(0,0,0,0.08))' }}>
                <span className="text-sm font-semibold opacity-60">মোট {shopTotal}টি Shop</span>
                {shopsLoading && <RefreshCw className="w-4 h-4 animate-spin opacity-40" />}
              </div>

              <div className="divide-y" style={{ borderColor: 'var(--border, rgba(0,0,0,0.06))' }}>
                {shops.length === 0 && (
                  <div className="px-5 py-8 text-center opacity-40 text-sm">কোনো Shop নেই</div>
                )}
                {shops.map(shop => {
                  const cfg  = SHOP_STATUS[shop.status]
                  const Icon = cfg.icon
                  return (
                    <div key={shop.id} className="px-5 py-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{shop.shopName}</p>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: cfg.bg, color: cfg.color }}>
                              <Icon className="w-3 h-3" />{cfg.label}
                            </span>
                          </div>
                          <p className="text-xs opacity-50 mt-0.5">
                            {shop.area}, {shop.district} · {shop.phone}
                          </p>
                          <p className="text-xs opacity-40 mt-0.5">
                            Owner: {shop.user.name} ({shop.user.email})
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">{shop._count.redemptions} redemptions</p>
                          <p className="text-xs opacity-40">
                            {new Date(shop.createdAt).toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {shop.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleShopAction(shop.id, 'approve')}
                            disabled={actionLoading === shop.id + 'approve'}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition"
                            style={{ background: '#2e7d32' }}>
                            <CheckCircle className="w-3.5 h-3.5" />
                            {actionLoading === shop.id + 'approve' ? 'Loading…' : 'Approve'}
                          </button>
                        )}
                        {shop.status !== 'SUSPENDED' && (
                          <button
                            onClick={() => handleShopAction(shop.id, 'suspend')}
                            disabled={actionLoading === shop.id + 'suspend'}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition"
                            style={{ background: '#c62828' }}>
                            <XCircle className="w-3.5 h-3.5" />
                            {actionLoading === shop.id + 'suspend' ? 'Loading…' : 'Suspend'}
                          </button>
                        )}
                        {shop.status !== 'PENDING' && (
                          <button
                            onClick={() => handleShopAction(shop.id, 'pending')}
                            disabled={actionLoading === shop.id + 'pending'}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border"
                            style={{ borderColor: '#f57c00', color: '#f57c00' }}>
                            <Clock className="w-3.5 h-3.5" />
                            Reset to Pending
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              <div className="px-5 py-3 flex items-center justify-between border-t"
                style={{ borderColor: 'var(--border, rgba(0,0,0,0.06))' }}>
                <span className="text-xs opacity-50">Page {shopPage} / {Math.ceil(shopTotal / LIMIT) || 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => setShopPage(p => Math.max(1, p - 1))} disabled={shopPage === 1}
                    className="p-1.5 rounded-lg border disabled:opacity-30"
                    style={{ borderColor: 'var(--border, rgba(0,0,0,0.1))' }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShopPage(p => p + 1)} disabled={shopPage * LIMIT >= shopTotal}
                    className="p-1.5 rounded-lg border disabled:opacity-30"
                    style={{ borderColor: 'var(--border, rgba(0,0,0,0.1))' }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
