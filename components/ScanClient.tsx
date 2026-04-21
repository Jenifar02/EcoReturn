'use client'

/**
 * components/ScanClient.tsx — UPDATED
 * Key change: Token code is shown ONCE with a prominent save warning.
 * After user acknowledges, code is cleared from state (never stored).
 */

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLang } from '@/lib/providers'
import {
  Camera, CameraOff, Trash2, Plus, Zap, Shield,
  AlertCircle, CheckCircle, Copy, Eye, EyeOff, AlertTriangle
} from 'lucide-react'
import BlockchainBadge from './BlockchainBadge'

interface ScanRow {
  code:   string
  type:   string
  refund: number
}

interface TokenResult {
  code:           string   // plaintext — shown once only
  codePrefix:     string   // e.g. "ECO-7K"
  amount:         number
  hash:           string
  expiresAt:      string
  acknowledged:   boolean  // user clicked "I saved it"
}

const REFUNDS: Record<string, number> = {
  'PET 500ml': 5,
  'PET 1L':    7,
  'Glass':     10,
  'Aluminium': 8,
}

export default function ScanClient() {
  const { t }      = useLang()
  const { data: session } = useSession()
  const router     = useRouter()

  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  const [status,      setStatus]      = useState(t('scannerIdle'))
  const [scanning,    setScanning]    = useState(false)
  const [rows,        setRows]        = useState<ScanRow[]>([])
  const [manualCode,  setManualCode]  = useState('')
  const [manualType,  setManualType]  = useState('PET 500ml')
  const [lastCode,    setLastCode]    = useState('')
  const [generating,  setGenerating]  = useState(false)
  const [tokenResult, setTokenResult] = useState<TokenResult | null>(null)
  const [genError,    setGenError]    = useState('')
  const [codeCopied,  setCodeCopied]  = useState(false)

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
        formats: ['ean_13', 'ean_8', 'code_128', 'qr_code', 'upc_a'],
      })
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      setStatus('Scanning…')

      timerRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return
        try {
          const codes = await detector.detect(videoRef.current)
          if (codes.length > 0) {
            const val = codes[0].rawValue
            if (val !== lastCode) {
              addRow(val, manualType)
              setLastCode(val)
            }
          }
        } catch { /* ignore frame errors */ }
      }, 400)
    } catch (err) {
      setStatus('Camera access denied.')
    }
  }

  const generateToken = async () => {
    if (rows.length === 0) return
    setGenerating(true)
    setGenError('')

    try {
      const res = await fetch('/api/tokens', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bottles: rows.map(r => ({
            barcode:     r.code,
            bottleType:  r.type,
            refundValue: r.refund,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setGenError(data.error || 'Generation failed')
        return
      }

      // Store result — plaintext code lives in state temporarily
      setTokenResult({
        code:         data.token,
        codePrefix:   data.codePrefix,
        amount:       data.totalAmount,
        hash:         data.blockchainHash,
        expiresAt:    data.expiresAt,
        acknowledged: false,
      })
      setRows([])
      stopScan()
    } catch {
      setGenError('Network error')
    } finally {
      setGenerating(false)
    }
  }

  const copyCode = async () => {
    if (!tokenResult) return
    await navigator.clipboard.writeText(tokenResult.code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const acknowledgeToken = () => {
    // User confirms they saved the code → clear plaintext from state
    setTokenResult(prev => prev ? { ...prev, acknowledged: true, code: '' } : null)
  }

  const resetAfterToken = () => {
    setTokenResult(null)
    setStatus(t('scannerIdle'))
  }

  // ── One-time token display modal ──────────────────────────────────────
  if (tokenResult && !tokenResult.acknowledged) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--eco-bg)' }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--eco-card)' }}>

          {/* Warning header */}
          <div className="p-5 text-center" style={{ background: '#b71c1c' }}>
            <AlertTriangle className="w-10 h-10 text-white mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">⚠️ এই code টি SAVE করুন!</h2>
            <p className="text-red-100 text-sm mt-1">এটি আর কখনো দেখানো হবে না</p>
          </div>

          <div className="p-6 space-y-5">
            {/* The token code — big and clear */}
            <div className="rounded-xl border-2 p-4 text-center" style={{ borderColor: 'var(--eco-primary)', background: 'rgba(46,125,50,0.05)' }}>
              <p className="text-xs font-semibold mb-2 opacity-60">আপনার Token Code</p>
              <p className="text-3xl font-mono font-bold tracking-widest" style={{ color: 'var(--eco-primary)' }}>
                {tokenResult.code}
              </p>
              <p className="text-sm opacity-50 mt-1">
                মেয়াদ: {new Date(tokenResult.expiresAt).toLocaleDateString('bn-BD')}
              </p>
            </div>

            {/* Amount */}
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--eco-accent)' }}>
                ৳{tokenResult.amount}
              </p>
              <p className="text-sm opacity-60">এই পরিমাণ টাকা পাবেন</p>
            </div>

            {/* Copy button */}
            <button
              onClick={copyCode}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all"
              style={{ background: codeCopied ? '#388e3c' : 'var(--eco-primary)', color: 'white' }}
            >
              {codeCopied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {codeCopied ? 'Copied!' : 'Code Copy করুন'}
            </button>

            {/* Screenshot reminder */}
            <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(255,152,0,0.1)', color: '#e65100' }}>
              <p className="font-semibold">📸 Screenshot নিন অথবা লিখে রাখুন</p>
              <p className="mt-1 opacity-80">Shop-এ গিয়ে এই code দিলে টাকা পাবেন। Code হারিয়ে গেলে টাকা পাওয়া যাবে না।</p>
            </div>

            {/* Blockchain info */}
            <BlockchainBadge hash={tokenResult.hash} />

            {/* Acknowledge button */}
            <button
              onClick={acknowledgeToken}
              className="w-full py-4 rounded-xl font-bold text-white transition-all"
              style={{ background: 'var(--eco-primary)' }}
            >
              ✅ Code Save করেছি — Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Post-acknowledgment success screen ────────────────────────────────
  if (tokenResult && tokenResult.acknowledged) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--eco-bg)' }}>
        <div className="w-full max-w-sm rounded-2xl p-8 text-center shadow-xl" style={{ background: 'var(--eco-card)' }}>
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--eco-primary)' }} />
          <h2 className="text-2xl font-bold mb-2">Token তৈরি হয়েছে!</h2>
          <p className="opacity-60 mb-1">Prefix: <span className="font-mono font-bold">{tokenResult.codePrefix}***</span></p>
          <p className="opacity-60 mb-6 text-sm">Dashboard-এ এই token এর status দেখতে পাবেন</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={resetAfterToken}
              className="w-full py-3 rounded-xl font-semibold text-white"
              style={{ background: 'var(--eco-primary)' }}
            >
              আরো Bottle Scan করুন
            </button>
            <Link
              href="/dashboard"
              className="block w-full py-3 rounded-xl font-semibold text-center border"
              style={{ borderColor: 'var(--eco-primary)', color: 'var(--eco-primary)' }}
            >
              Dashboard দেখুন
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Main scanner UI ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--eco-bg)' }}>
      <div className="max-w-xl mx-auto space-y-4">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{t('scanTitle')}</h1>
          <p className="text-sm opacity-60 mt-1">{t('scanSubtitle')}</p>
        </div>

        {/* Camera */}
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'var(--eco-card)' }}>
          <div className="relative aspect-video bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CameraOff className="w-12 h-12 opacity-30 text-white" />
              </div>
            )}
            {scanning && (
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="text-xs text-white bg-black/60 px-3 py-1 rounded-full">{status}</span>
              </div>
            )}
          </div>
          <div className="p-3 flex gap-2">
            {!scanning ? (
              <button
                onClick={startScan}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white"
                style={{ background: 'var(--eco-primary)' }}
              >
                <Camera className="w-4 h-4" /> Camera চালু করুন
              </button>
            ) : (
              <button
                onClick={stopScan}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold"
                style={{ background: 'rgba(211,47,47,0.1)', color: '#d32f2f' }}
              >
                <CameraOff className="w-4 h-4" /> বন্ধ করুন
              </button>
            )}
          </div>
        </div>

        {/* Manual entry */}
        <div className="rounded-2xl p-4 shadow" style={{ background: 'var(--eco-card)' }}>
          <p className="text-sm font-semibold mb-3 opacity-70">Manual Entry</p>
          <div className="flex gap-2 mb-2">
            <input
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { addRow(manualCode, manualType); setManualCode('') } }}
              placeholder="Barcode number লিখুন"
              className="flex-1 rounded-lg px-3 py-2 text-sm border"
              style={{ background: 'var(--eco-bg)', borderColor: 'rgba(0,0,0,0.1)' }}
            />
            <select
              value={manualType}
              onChange={e => setManualType(e.target.value)}
              className="rounded-lg px-2 py-2 text-sm border"
              style={{ background: 'var(--eco-bg)', borderColor: 'rgba(0,0,0,0.1)' }}
            >
              {Object.keys(REFUNDS).map(t => <option key={t}>{t}</option>)}
            </select>
            <button
              onClick={() => { addRow(manualCode, manualType); setManualCode('') }}
              className="px-3 py-2 rounded-lg text-white"
              style={{ background: 'var(--eco-primary)' }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scanned bottles */}
        {rows.length > 0 && (
          <div className="rounded-2xl overflow-hidden shadow" style={{ background: 'var(--eco-card)' }}>
            <div className="p-3 flex items-center justify-between border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <span className="font-semibold text-sm">{rows.length}টি Bottle — মোট ৳{total}</span>
              <button onClick={() => setRows([])} className="text-xs opacity-50 hover:opacity-100">
                সব মুছুন
              </button>
            </div>
            <div className="divide-y max-h-60 overflow-y-auto" style={{ divideColor: 'rgba(0,0,0,0.04)' }}>
              {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-mono text-xs opacity-50">{r.code}</p>
                    <p className="font-medium">{r.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold" style={{ color: 'var(--eco-primary)' }}>৳{r.refund}</span>
                    <button onClick={() => setRows(prev => prev.filter((_, j) => j !== i))}>
                      <Trash2 className="w-4 h-4 opacity-40 hover:opacity-100" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {genError && (
              <div className="mx-4 mb-3 p-3 rounded-lg text-sm" style={{ background: 'rgba(211,47,47,0.1)', color: '#d32f2f' }}>
                <AlertCircle className="w-4 h-4 inline mr-1" />{genError}
              </div>
            )}

            <div className="p-4">
              <button
                onClick={generateToken}
                disabled={generating}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'var(--eco-primary)' }}
              >
                {generating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Zap className="w-5 h-5" /> Token Generate করুন</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Security notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl text-sm" style={{ background: 'rgba(46,125,50,0.06)' }}>
          <Shield className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--eco-primary)' }} />
          <p className="opacity-70">
            আপনার token code encrypted আকারে store হয়। Admin বা কেউ এটি দেখতে পারবে না। শুধু আপনি এবং shop owner verify করতে পারবেন।
          </p>
        </div>

      </div>
    </div>
  )
}
