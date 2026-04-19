'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLang } from '@/lib/providers'
import { Plus, Minus, Zap, Shield, Info } from 'lucide-react'

export default function ManualClient() {
  const { t } = useLang()
  const { data: session } = useSession()
  const router = useRouter()

  const [oldCount,    setOldCount]    = useState(0)  // no-barcode bottles (4 = ৳1)
  const [pet500,      setPet500]      = useState(0)
  const [pet1l,       setPet1l]       = useState(0)
  const [glass,       setGlass]       = useState(0)
  const [aluminium,   setAluminium]   = useState(0)
  const [generating,  setGenerating]  = useState(false)
  const [error,       setError]       = useState('')

  const RATES: Record<string, number> = {
    'PET 500ml': 5, 'PET 1L': 7, 'Glass': 10, 'Aluminium': 8,
  }

  const oldRefund    = Math.floor(oldCount / 4) * 1
  const newRefund    = pet500 * 5 + pet1l * 7 + glass * 10 + aluminium * 8
  const totalRefund  = oldRefund + newRefund
  const totalBottles = oldCount + pet500 + pet1l + glass + aluminium

  const Counter = ({
    label, value, onChange, rate, note,
  }: {
    label: string; value: number; onChange: (v: number) => void; rate: string; note?: string
  }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <div>
        <div className="font-bold text-sm">{label}</div>
        <div className="text-xs opacity-55 mt-0.5">{rate}</div>
        {note && <div className="text-xs mt-0.5" style={{ color: 'var(--eco-primary)' }}>{note}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full border flex items-center justify-center font-bold transition hover:bg-eco-primary/10 cursor-pointer"
          style={{ borderColor: 'var(--border)' }}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-8 text-center font-black text-lg" style={{ color: 'var(--eco-primary)' }}>
          {value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition hover:opacity-80 cursor-pointer"
          style={{ background: 'var(--eco-primary)' }}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )

  const handleGenerate = async () => {
    if (totalBottles === 0 || totalRefund === 0) return
    if (!session) { router.push('/login'); return }

    setGenerating(true)
    setError('')

    // Build fake barcodes for manual entries
    const bottles = []
    for (let i = 0; i < pet500;    i++) bottles.push({ barcode: `MAN-PET500-${Date.now()}-${i}`,    bottleType: 'PET 500ml', refundValue: 5  })
    for (let i = 0; i < pet1l;     i++) bottles.push({ barcode: `MAN-PET1L-${Date.now()}-${i}`,     bottleType: 'PET 1L',   refundValue: 7  })
    for (let i = 0; i < glass;     i++) bottles.push({ barcode: `MAN-GLASS-${Date.now()}-${i}`,     bottleType: 'Glass',    refundValue: 10 })
    for (let i = 0; i < aluminium; i++) bottles.push({ barcode: `MAN-ALUM-${Date.now()}-${i}`,      bottleType: 'Aluminium',refundValue: 8  })
    // Old bottles: 4 per ৳1 batch
    const batches = Math.floor(oldCount / 4)
    for (let i = 0; i < batches;   i++) bottles.push({ barcode: `MAN-OLD4-${Date.now()}-${i}`,      bottleType: 'Old (4x)', refundValue: 1  })

    const res  = await fetch('/api/tokens', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ bottles }),
    })
    const data = await res.json()
    setGenerating(false)

    if (!res.ok) setError(data.error || 'Failed.')
    else         router.push(`/redeem?token=${data.token}`)
  }

  return (
    <>
      {/* Page hero */}
      <div className="py-10 px-4" style={{
        background: 'radial-gradient(720px 380px at 10% 0%, rgba(102,187,106,0.18), transparent 60%), linear-gradient(180deg, rgba(242,242,242,0.9), rgba(255,255,255,1))',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow mb-3">No camera needed</div>
          <h1 className="text-4xl font-black mb-2" style={{ letterSpacing: '-0.03em' }}>Manual Process</h1>
          <p className="opacity-75">Count your bottles manually and generate a refund token.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Counters */}
          <div className="lg:col-span-2 panel flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-black mb-1">Count your bottles</h2>
              <p className="text-sm opacity-60">Use the +/- buttons to count each type.</p>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.15)' }}>
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--eco-primary)' }} />
              <span className="opacity-75">Manual process is for bottles you&apos;ve already counted physically. Staff may verify counts at redemption.</span>
            </div>

            <div className="flex flex-col gap-3">
              <Counter
                label="Old bottles (no barcode)"
                value={oldCount}
                onChange={setOldCount}
                rate="৳1 per 4 bottles"
                note={oldCount >= 4 ? `${Math.floor(oldCount / 4)} batch(es) = ৳${Math.floor(oldCount / 4)}` : 'Need 4 bottles per ৳1'}
              />
              <Counter label="PET 500ml (with barcode)" value={pet500}    onChange={setPet500}    rate="৳5 each" />
              <Counter label="PET 1L (with barcode)"    value={pet1l}     onChange={setPet1l}     rate="৳7 each" />
              <Counter label="Glass bottle"             value={glass}     onChange={setGlass}     rate="৳10 each" />
              <Counter label="Aluminium can"            value={aluminium} onChange={setAluminium} rate="৳8 each" />
            </div>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-4">
            <div className="panel">
              <h3 className="font-black text-lg mb-4">Summary</h3>

              <div className="flex flex-col gap-2 mb-5">
                {[
                  { label: 'Total bottles',  value: totalBottles },
                  { label: 'Old bottles',    value: `${oldCount} → ৳${oldRefund}` },
                  { label: 'New bottles',    value: `${pet500 + pet1l + glass + aluminium} → ৳${newRefund}` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <span className="opacity-65">{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl text-center mb-5" style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.2)' }}>
                <div className="text-xs opacity-55 mb-1">Total refund</div>
                <div className="text-4xl font-black" style={{ color: 'var(--eco-primary)', letterSpacing: '-0.02em' }}>
                  ৳{totalRefund}
                </div>
              </div>

              {error && (
                <div className="mb-3 p-3 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={totalRefund === 0 || generating}
                className="btn-eco w-full justify-center py-3 text-base disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {generating ? 'Generating...' : 'Generate Token'}
                <Shield className="w-4 h-4 opacity-70" />
              </button>

              {!session && (
                <p className="text-xs text-center opacity-55 mt-2">
                  You&apos;ll be asked to{' '}
                  <Link href="/login" className="font-bold" style={{ color: 'var(--eco-primary)' }}>sign in</Link>
                </p>
              )}
            </div>

            <div className="panel" style={{ background: 'rgba(46,125,50,0.04)', border: '1px solid rgba(46,125,50,0.12)' }}>
              <div className="flex items-center gap-2 mb-2 font-bold text-sm" style={{ color: 'var(--eco-primary)' }}>
                <Shield className="w-4 h-4" />
                Blockchain Secured
              </div>
              <p className="text-xs opacity-65">Your token is hashed and immutably recorded — no one can alter it after generation.</p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
