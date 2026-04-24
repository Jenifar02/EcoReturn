'use client'

/**
 * components/AdminBarcodesClient.tsx
 * Admin panel — barcode batch generate + download + list
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  QrCode, Download, Plus, RefreshCw,
  CheckCircle, AlertCircle, Filter
} from 'lucide-react'

const BOTTLE_TYPES = ['PET 500ml', 'PET 1L', 'Glass', 'Aluminium'] as const
type BottleType = typeof BOTTLE_TYPES[number]

const REFUND_MAP: Record<BottleType, number> = {
  'PET 500ml': 5,
  'PET 1L':    7,
  'Glass':     10,
  'Aluminium': 8,
}

interface Barcode {
  id:          string
  barcode:     string
  bottleType:  string
  refundValue: number
  brand:       string | null
  isUsed:      boolean
  createdAt:   string
}

export default function AdminBarcodesClient() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Generate form state
  const [bottleType, setBottleType] = useState<BottleType>('PET 500ml')
  const [count,      setCount]      = useState(10)
  const [brand,      setBrand]      = useState('')
  const [generating, setGenerating] = useState(false)
  const [genSuccess, setGenSuccess] = useState('')
  const [genError,   setGenError]   = useState('')

  // List state
  const [barcodes,     setBarcodes]     = useState<Barcode[]>([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [filterType,   setFilterType]   = useState('')
  const [filterUsed,   setFilterUsed]   = useState('')
  const [listLoading,  setListLoading]  = useState(false)

  // Auth guard — ADMIN only
  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Fetch barcode list
  const fetchBarcodes = async (p = 1) => {
    setListLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (filterType) params.set('type', filterType)
    if (filterUsed !== '') params.set('used', filterUsed)

    try {
      const res  = await fetch(`/api/admin/barcodes?${params}`)
      const data = await res.json()
      setBarcodes(data.barcodes || [])
      setTotal(data.total || 0)
      setPage(p)
    } catch {
      // silent
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') fetchBarcodes(1)
  }, [status, filterType, filterUsed])

  // Generate barcodes
  const handleGenerate = async () => {
    setGenerating(true)
    setGenError('')
    setGenSuccess('')

    try {
      const res  = await fetch('/api/admin/barcodes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bottleType, count, brand: brand || undefined }),
      })
      const data = await res.json()

      if (!res.ok) {
        setGenError(data.error || 'Generation failed')
        return
      }

      setGenSuccess(data.message)
      fetchBarcodes(1)

      // Auto CSV download
      downloadCSV(data.barcodes, bottleType)

    } catch {
      setGenError('Network error')
    } finally {
      setGenerating(false)
    }
  }

  // CSV download helper
  const downloadCSV = (barcodeList: string[], type: string) => {
    const refund = REFUND_MAP[type as BottleType] ?? 0
    const header = 'Barcode,BottleType,RefundValue(BDT),Brand'
    const rows   = barcodeList.map(b => `${b},${type},${refund},${brand || ''}`)
    const csv    = [header, ...rows].join('\n')
    const blob   = new Blob([csv], { type: 'text/csv' })
    const url    = URL.createObjectURL(blob)
    const a      = document.createElement('a')
    a.href       = url
    a.download   = `barcodes-${type.replace(/\s/g, '-')}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Download all filtered barcodes as CSV
  const downloadAll = () => {
    if (barcodes.length === 0) return
    const header = 'Barcode,BottleType,RefundValue(BDT),Brand,IsUsed,CreatedAt'
    const rows   = barcodes.map(b =>
      `${b.barcode},${b.bottleType},${b.refundValue},${b.brand || ''},${b.isUsed},${b.createdAt}`
    )
    const csv  = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `barcodes-export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--eco-primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--eco-bg)' }}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <QrCode className="w-6 h-6" style={{ color: 'var(--eco-primary)' }} />
              Barcode Management
            </h1>
            <p className="text-sm opacity-60 mt-1">EAN-13 barcode generate ও manage করুন</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(46,125,50,0.1)', color: 'var(--eco-primary)' }}>
            ADMIN
          </span>
        </div>

        {/* Generate Form */}
        <div className="rounded-2xl p-6 shadow" style={{ background: 'var(--eco-card)' }}>
          <h2 className="font-bold text-lg mb-4">নতুন Barcode Generate করুন</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Bottle type */}
            <div>
              <label className="text-xs font-semibold opacity-60 mb-1 block">Bottle Type</label>
              <select
                value={bottleType}
                onChange={e => setBottleType(e.target.value as BottleType)}
                className="w-full rounded-lg px-3 py-2 text-sm border"
                style={{ background: 'var(--eco-bg)', borderColor: 'rgba(0,0,0,0.1)' }}
              >
                {BOTTLE_TYPES.map(t => (
                  <option key={t} value={t}>{t} — ৳{REFUND_MAP[t]}</option>
                ))}
              </select>
            </div>

            {/* Count */}
            <div>
              <label className="text-xs font-semibold opacity-60 mb-1 block">পরিমাণ (১–৫০০)</label>
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={e => setCount(Math.min(500, Math.max(1, Number(e.target.value))))}
                className="w-full rounded-lg px-3 py-2 text-sm border"
                style={{ background: 'var(--eco-bg)', borderColor: 'rgba(0,0,0,0.1)' }}
              />
            </div>

            {/* Brand */}
            <div>
              <label className="text-xs font-semibold opacity-60 mb-1 block">Brand (optional)</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="যেমন: Acme Beverages"
                className="w-full rounded-lg px-3 py-2 text-sm border"
                style={{ background: 'var(--eco-bg)', borderColor: 'rgba(0,0,0,0.1)' }}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg p-3 mb-4 text-sm flex items-center gap-3"
            style={{ background: 'rgba(46,125,50,0.06)' }}>
            <QrCode className="w-4 h-4 shrink-0" style={{ color: 'var(--eco-primary)' }} />
            <span className="opacity-70">
              {count}টি <strong>{bottleType}</strong> barcode generate হবে — প্রতিটার refund মূল্য <strong>৳{REFUND_MAP[bottleType]}</strong>।
              Generate হওয়ার সাথে সাথে CSV download হবে।
            </span>
          </div>

          {genSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
              style={{ background: 'rgba(46,125,50,0.1)', color: '#2e7d32' }}>
              <CheckCircle className="w-4 h-4" /> {genSuccess}
            </div>
          )}
          {genError && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
              style={{ background: 'rgba(211,47,47,0.1)', color: '#d32f2f' }}>
              <AlertCircle className="w-4 h-4" /> {genError}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--eco-primary)' }}
          >
            {generating
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Plus className="w-4 h-4" />
            }
            {generating ? 'Generating...' : `${count}টি Barcode Generate করুন`}
          </button>
        </div>

        {/* Barcode List */}
        <div className="rounded-2xl overflow-hidden shadow" style={{ background: 'var(--eco-card)' }}>
          <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b"
            style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 opacity-50" />
              <span className="font-semibold text-sm">সব Barcode ({total}টি)</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter by type */}
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="rounded-lg px-2 py-1.5 text-xs border"
                style={{ background: 'var(--eco-bg)', borderColor: 'rgba(0,0,0,0.1)' }}
              >
                <option value="">সব Type</option>
                {BOTTLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* Filter by used */}
              <select
                value={filterUsed}
                onChange={e => setFilterUsed(e.target.value)}
                className="rounded-lg px-2 py-1.5 text-xs border"
                style={{ background: 'var(--eco-bg)', borderColor: 'rgba(0,0,0,0.1)' }}
              >
                <option value="">সব Status</option>
                <option value="0">Unused</option>
                <option value="1">Used</option>
              </select>

              {/* Refresh */}
              <button onClick={() => fetchBarcodes(page)}
                className="p-1.5 rounded-lg border"
                style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <RefreshCw className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Download CSV */}
              <button
                onClick={downloadAll}
                disabled={barcodes.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
                style={{ background: 'var(--eco-primary)' }}
              >
                <Download className="w-3.5 h-3.5" /> CSV Download
              </button>
            </div>
          </div>

          {/* Table */}
          {listLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 rounded-full animate-spin"
                style={{ borderColor: 'var(--eco-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : barcodes.length === 0 ? (
            <div className="text-center py-12 opacity-40">
              <QrCode className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">কোনো barcode নেই</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs opacity-50 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                      <th className="text-left px-4 py-3">Barcode</th>
                      <th className="text-left px-4 py-3">Type</th>
                      <th className="text-left px-4 py-3">Refund</th>
                      <th className="text-left px-4 py-3">Brand</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                    {barcodes.map(b => (
                      <tr key={b.id} className="hover:bg-black/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{b.barcode}</td>
                        <td className="px-4 py-3">{b.bottleType}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--eco-primary)' }}>
                          ৳{b.refundValue}
                        </td>
                        <td className="px-4 py-3 opacity-60">{b.brand || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              background: b.isUsed ? 'rgba(198,40,40,0.1)' : 'rgba(46,125,50,0.1)',
                              color:      b.isUsed ? '#c62828' : '#2e7d32',
                            }}>
                            {b.isUsed ? 'Used' : 'Available'}
                          </span>
                        </td>
                        <td className="px-4 py-3 opacity-50 text-xs">
                          {new Date(b.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > 50 && (
                <div className="flex items-center justify-between px-4 py-3 border-t text-sm"
                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <span className="opacity-50">Page {page} — {total}টির মধ্যে {barcodes.length}টি দেখাচ্ছে</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchBarcodes(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1 rounded-lg border disabled:opacity-30"
                      style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                    >← আগে</button>
                    <button
                      onClick={() => fetchBarcodes(page + 1)}
                      disabled={page * 50 >= total}
                      className="px-3 py-1 rounded-lg border disabled:opacity-30"
                      style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                    >পরে →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
