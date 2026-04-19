'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLang } from '@/lib/providers'
import { Camera, CameraOff, Trash2, Plus, Zap, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import BlockchainBadge from './BlockchainBadge'

interface ScanRow {
  code: string
  type: string
  refund: number
}

const REFUNDS: Record<string, number> = {
  'PET 500ml': 5,
  'PET 1L':    7,
  'Glass':     10,
  'Aluminium': 8,
}

export default function ScanClient() {
  const { t } = useLang()
  const { data: session } = useSession()
  const router = useRouter()

  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  const [status,      setStatus]      = useState(t('scannerIdle'))
  const [scanning,    setScanning]    = useState(false)
  const [rows,        setRows]        = useState<ScanRow[]>([])
  const [manualCode,  setManualCode]  = useState('')
  const [manualType,  setManualType]  = useState('PET 500ml')
  const [lastCode,    setLastCode]    = useState('')
  const [generating,  setGenerating]  = useState(false)
  const [tokenResult, setTokenResult] = useState<{ code: string; hash: string; amount: number } | null>(null)
  const [genError,    setGenError]    = useState('')

  const total = rows.reduce((s, r) => s + r.refund, 0)

  const addRow = useCallback((code: string, type: string) => {
    const norm = code.trim()
    if (!norm) return
    setRows(prev => {
      if (prev.some(r => r.code === norm)) {
        setStatus(`${t('duplicate')}: ${norm}`)
        return prev
      }
      setLastCode(norm)
      setStatus(`Scanned: ${norm}`)
      return [{ code: norm, type, refund: REFUNDS[type] ?? 5 }, ...prev]
    })
  }, [t])

  const stopScan = useCallback(async () => {
    setScanning(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus('Scanner stopped.')
  }, [])

  const startScan = async () => {
    if (!('mediaDevices' in navigator)) {
      setStatus('Camera not supported. Use manual entry.')
      return
    }
    if (!('BarcodeDetector' in window)) {
      setStatus('BarcodeDetector not supported. Use manual entry.')
      return
    }

    try {
      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'qr_code', 'upc_a']
      })

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, audio: false
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setScanning(true)
      setStatus(t('scanning'))

      timerRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return
        try {
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes?.length > 0) {
            addRow(barcodes[0].rawValue, 'PET 500ml')
          }
        } catch { /* ignore */ }
      }, 350)

    } catch {
      setStatus('Camera permission denied or unavailable.')
    }
  }

  useEffect(() => () => { stopScan() }, [stopScan])

  const handleGenerate = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    setGenerating(true)
    setGenError('')

    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bottles: rows.map(r => ({ barcode: r.code, bottleType: r.type, refundValue: r.refund }))
      }),
    })

    const data = await res.json()
    setGenerating(false)

    if (!res.ok) {
      setGenError(data.error || 'Failed to generate token.')
    } else {
      setTokenResult({ code: data.token, hash: data.blockchainHash, amount: data.totalAmount })
    }
  }

  // ── Token success modal ──
  if (tokenResult) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-md mx-auto panel text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(46,125,50,0.1)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: 'var(--eco-primary)' }} />
          </div>
          <h2 className="text-2xl font-black mb-1" style={{ letterSpacing: '-0.02em' }}>Token Generated!</h2>
          <p className="opacity-65 text-sm mb-6">Your refund token is ready to redeem.</p>

          <div className="p-4 rounded-xl mb-4 font-mono text-2xl font-black text-center" style={{ background: 'rgba(46,125,50,0.08)', border: '1px solid rgba(46,125,50,0.2)', color: 'var(--eco-primary)' }}>
            {tokenResult.code}
          </div>

          <div className="flex items-center justify-between text-sm mb-4 opacity-75">
            <span>{rows.length} bottles</span>
            <span className="font-bold">৳{tokenResult.amount} refund</span>
          </div>

          <div className="mb-6 flex justify-center">
            <BlockchainBadge hash={tokenResult.hash} size="md" />
          </div>

          <div className="flex gap-3">
            <Link href={`/redeem?token=${tokenResult.code}`} className="btn-eco flex-1 justify-center">
              {t('redeemNow')}
            </Link>
            <button onClick={() => { setTokenResult(null); setRows([]) }} className="btn-outline-eco flex-1">
              Scan more
            </button>
          </div>
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
            <Camera className="w-4 h-4" />
            Scan from your phone
          </div>
          <h1 className="text-4xl font-black mb-2" style={{ letterSpacing: '-0.03em' }}>{t('scanTitle')}</h1>
          <p className="opacity-75">{t('scanSubtitle')}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-7 gap-5">

          {/* ── Camera panel (4/7) ── */}
          <div className="lg:col-span-4 panel flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-black">{t('cameraScanner')}</h2>
              <p className="text-sm opacity-60 mt-0.5">Works best on mobile with HTTPS.</p>
            </div>

            {/* Video */}
            <div className="relative rounded-xl overflow-hidden aspect-video" style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center opacity-40">
                    <CameraOff className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Camera off</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm opacity-60">{status}</p>

            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
              <button onClick={startScan} disabled={scanning} className="btn-eco text-sm py-2 disabled:opacity-50">
                <Camera className="w-4 h-4" />
                {t('startScan')}
              </button>
              <button onClick={stopScan} disabled={!scanning} className="btn-outline-eco text-sm py-2 disabled:opacity-40">
                {t('stop')}
              </button>
              <button onClick={() => { setRows([]); setLastCode('') }} className="btn-outline-eco text-sm py-2">
                <Trash2 className="w-4 h-4" />
                {t('clear')}
              </button>
            </div>

            {/* Last code */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">{t('lastScanned')}</label>
              <input className="eco-input" value={lastCode} readOnly placeholder="Scan to fill" />
            </div>

            {/* Table */}
            {rows.length > 0 && (
              <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-sm">
                  <thead style={{ background: 'rgba(46,125,50,0.06)' }}>
                    <tr>
                      <th className="text-left px-3 py-2 font-bold">Code</th>
                      <th className="text-left px-3 py-2 font-bold">Type</th>
                      <th className="text-right px-3 py-2 font-bold">৳</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.code} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                        <td className="px-3 py-2 font-mono text-xs">{r.code}</td>
                        <td className="px-3 py-2">{r.type}</td>
                        <td className="px-3 py-2 text-right font-bold" style={{ color: 'var(--eco-primary)' }}>{r.refund}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <tr>
                      <td colSpan={2} className="px-3 py-2 font-bold">{rows.length} bottles</td>
                      <td className="px-3 py-2 text-right font-black text-base" style={{ color: 'var(--eco-primary)' }}>৳{total}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Generate button */}
            {genError && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {genError}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={rows.length === 0 || generating}
              className="btn-eco justify-center py-3 text-base disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {generating ? 'Generating...' : t('generateToken')}
              <Shield className="w-4 h-4 opacity-70" />
            </button>

            {!session && rows.length > 0 && (
              <p className="text-sm text-center opacity-65">
                You'll be asked to <Link href="/login" className="font-bold" style={{ color: 'var(--eco-primary)' }}>sign in</Link> to generate a token.
              </p>
            )}
          </div>

          {/* ── Manual entry panel (3/7) ── */}
          <div className="lg:col-span-3 panel flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-black">{t('manualEntry')}</h2>
              <p className="text-sm opacity-60 mt-0.5">If your device cannot scan.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">{t('barcode')}</label>
              <input
                className="eco-input"
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="e.g., 8850000000000"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    addRow(manualCode, manualType)
                    setManualCode('')
                  }
                }}
              />
              <p className="text-xs opacity-50 mt-1">Use digits only when possible.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">{t('bottleType')}</label>
              <select
                className="eco-input"
                value={manualType}
                onChange={e => setManualType(e.target.value)}
              >
                {Object.keys(REFUNDS).map(k => (
                  <option key={k} value={k}>{k} — ৳{REFUNDS[k]}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => { addRow(manualCode, manualType); setManualCode('') }}
              className="btn-eco"
            >
              <Plus className="w-4 h-4" />
              {t('add')}
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)' }} />

            <div>
              <h3 className="font-bold text-base mb-3">Rules & Regulations</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm opacity-75">
                <li>Only accepted containers earn refunds (PET, glass, aluminium).</li>
                <li>Bottles must be empty, clean, and not crushed.</li>
                <li>Each barcode redeemable <strong>once</strong> — duplicates blocked.</li>
                <li>Refund value depends on type/size.</li>
                <li className="flex items-start gap-1.5">
                  <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--eco-primary)' }} />
                  Every token is hashed and recorded on the blockchain.
                </li>
              </ul>
            </div>

            {/* Blockchain info */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.15)' }}>
              <div className="flex items-center gap-2 mb-2 font-bold text-sm" style={{ color: 'var(--eco-primary)' }}>
                <Shield className="w-4 h-4" />
                Blockchain Security
              </div>
              <p className="text-xs opacity-70">Each token gets a SHA-256 hash stored immutably. No one can alter a past record — fraud is impossible.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
