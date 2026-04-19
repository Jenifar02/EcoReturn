'use client'

import Link from 'next/link'
import { useLang } from '@/lib/providers'
import { Recycle, Scan, Coins, Shield, ArrowRight, CheckCircle } from 'lucide-react'

export default function HowClient() {
  const { t } = useLang()

  const steps = [
    {
      n: '1', icon: Recycle, title: t('step1Title'), text: t('step1Text'),
      detail: 'Clean, empty PET bottles, glass bottles, or aluminium cans. Remove caps if possible.'
    },
    {
      n: '2', icon: Scan, title: t('step2Title'), text: t('step2Text'),
      detail: 'The machine uses a camera to read barcodes and count each bottle. Duplicates are instantly rejected.'
    },
    {
      n: '3', icon: Coins, title: t('step3Title'), text: t('step3Text'),
      detail: 'A token code like ECO-123456 is generated. It\'s valid for 7 days and is hashed on the blockchain.'
    },
  ]

  return (
    <>
      {/* Page hero */}
      <div className="py-10 px-4" style={{
        background: 'radial-gradient(720px 380px at 10% 0%, rgba(102,187,106,0.18), transparent 60%), linear-gradient(180deg, rgba(242,242,242,0.9), rgba(255,255,255,1))',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow mb-3">Simple for everyone</div>
          <h1 className="text-4xl font-black mb-2" style={{ letterSpacing: '-0.03em' }}>{t('howTitle')}</h1>
          <p className="opacity-75">Insert bottles, get a redeemable token, and help keep Bangladesh clean.</p>
        </div>
      </div>

      {/* Steps */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {steps.map(s => (
              <div key={s.n} className="feature-card relative">
                <div className="feature-icon mb-4">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-xl mb-2">{s.title}</h3>
                <p className="opacity-75 text-sm mb-3">{s.text}</p>
                <p className="text-xs opacity-55 border-t pt-3" style={{ borderColor: 'var(--border)' }}>{s.detail}</p>
                <div className="absolute top-4 right-4 text-6xl font-black opacity-5">{s.n}</div>
              </div>
            ))}
          </div>

          {/* Refund eligibility */}
          <div className="grid lg:grid-cols-2 gap-6 mb-16">
            <div className="panel">
              <h2 className="text-2xl font-black mb-4" style={{ letterSpacing: '-0.02em' }}>Refund eligibility</h2>
              <div className="space-y-3">
                {[
                  { type: 'PET 500ml bottle with barcode + EcoReturn symbol', val: '৳5', ok: true },
                  { type: 'PET 1L bottle with barcode + EcoReturn symbol',    val: '৳7', ok: true },
                  { type: 'Glass bottle with barcode + symbol',                val: '৳10', ok: true },
                  { type: 'Aluminium can with barcode + symbol',               val: '৳8', ok: true },
                  { type: 'Old bottles without barcode (4 bottles batch)',     val: '৳1', ok: true },
                  { type: 'Crushed or unreadable barcode',                     val: 'Rejected', ok: false },
                  { type: 'Already-used barcode',                              val: 'Rejected', ok: false },
                ].map(item => (
                  <div key={item.type} className="flex items-center justify-between gap-3 text-sm py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${item.ok ? '' : 'opacity-30'}`}
                        style={{ color: item.ok ? 'var(--eco-primary)' : '#9ca3af' }} />
                      <span className="opacity-80">{item.type}</span>
                    </div>
                    <span className={`font-bold flex-shrink-0 ${item.ok ? '' : 'text-red-500'}`}
                      style={{ color: item.ok ? 'var(--eco-primary)' : undefined }}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain explanation */}
            <div className="panel" style={{ background: 'linear-gradient(135deg, rgba(46,125,50,0.04), rgba(102,187,106,0.06))' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(46,125,50,0.1)' }}>
                  <Shield className="w-5 h-5" style={{ color: 'var(--eco-primary)' }} />
                </div>
                <h2 className="text-2xl font-black" style={{ letterSpacing: '-0.02em' }}>Blockchain Security</h2>
              </div>

              <p className="opacity-75 text-sm mb-5">Every bottle scan, token, and redemption is permanently recorded using blockchain technology — making fraud impossible.</p>

              <div className="space-y-3">
                {[
                  { step: '1', title: 'Scan recorded', desc: 'Each barcode scan creates a SHA-256 hash — a unique digital fingerprint.' },
                  { step: '2', title: 'Token hashed',  desc: 'The token is chained to previous hashes, forming an immutable audit trail.' },
                  { step: '3', title: 'Redemption sealed', desc: 'When you redeem, the event is cryptographically locked — can\'t be replayed.' },
                  { step: '4', title: 'On-chain option', desc: 'Optionally broadcast to Polygon blockchain for full public verification.' },
                ].map(item => (
                  <div key={item.step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-black text-white"
                      style={{ background: 'var(--eco-primary)' }}>
                      {item.step}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{item.title}</div>
                      <div className="text-xs opacity-60 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3 rounded-xl font-mono text-xs opacity-60 overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                SHA-256(userId + barcode + timestamp)<br />
                → 0x2e7d32a4f6c1...b3e9
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="cta-banner flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black mb-1" style={{ letterSpacing: '-0.02em' }}>Ready to start?</h2>
              <p className="opacity-90 text-sm">Find a machine or scan from your phone.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/scan" className="flex items-center gap-2 bg-white font-bold px-5 py-2.5 rounded-full text-sm no-underline hover:bg-gray-50 transition"
                style={{ color: 'var(--eco-primary)' }}>
                Scan now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/locations" className="flex items-center gap-2 bg-transparent border-2 border-white text-white font-bold px-5 py-2.5 rounded-full text-sm no-underline hover:bg-white/10 transition">
                {t('findMachine')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
