'use client'

import Link from 'next/link'
import { useLang } from '@/lib/providers'
import { Shield, Recycle, MapPin, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { t } = useLang()

  return (
    <>
      {/* ── Hero ──────────────────────────────────── */}
      <section className="hero" aria-label="EcoReturn hero">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left */}
            <div className="animate-fade-in-up">
              <div className="eyebrow mb-4">
                <Recycle className="w-4 h-4" />
                {t('heroEyebrow')}
              </div>
              <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
                {t('heroTitle')}
                <span className="block" style={{ color: 'var(--eco-primary)' }}>
                  {t('heroTagline')}
                </span>
              </h1>
              <p className="text-lg opacity-80 mb-8 max-w-lg">
                {t('heroLede')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/scan" className="btn-eco text-base px-6 py-3">
                  {t('insertBottles')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/how" className="btn-outline-eco text-base px-6 py-3">
                  {t('seeHowItWorks')}
                </Link>
              </div>

              <div className="hero-trust animation-delay-200 animate-fade-in-up">
                <div className="trust-item">
                  <div className="trust-kicker">{t('automatic')}</div>
                  <div className="trust-text">{t('scanCount')}</div>
                </div>
                <div className="trust-item">
                  <div className="trust-kicker">{t('instant')}</div>
                  <div className="trust-text">{t('refundCalc')}</div>
                </div>
                <div className="trust-item">
                  <div className="trust-kicker">{t('redeemable')}</div>
                  <div className="trust-text">{t('tokenGen')}</div>
                </div>
              </div>
            </div>

            {/* Right - Machine widget */}
            <div className="animation-delay-300 animate-fade-in-up">
              <div className="panel">
                <div className="machine mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-1/2 h-10 rounded-xl" style={{ background: 'rgba(46,125,50,0.15)', border: '1px solid rgba(46,125,50,0.2)' }}></div>
                    <div className="flex items-center gap-2 font-bold opacity-80 text-sm">
                      <div className="dot-pulse"></div>
                      <span>{t('readyStatus')}</span>
                    </div>
                  </div>
                  <div className="h-3 rounded-full mb-4" style={{ background: 'rgba(0,0,0,0.12)' }}></div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.06)' }}>
                      {t('insertPlastic')}
                    </span>
                    <span className="px-3 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.06)' }}>
                      {t('getToken')}
                    </span>
                    <span className="px-3 py-2 rounded-full text-sm font-bold flex items-center gap-1.5" style={{ background: 'rgba(46,125,50,0.08)', border: '1px solid rgba(46,125,50,0.2)', color: 'var(--eco-primary)' }}>
                      <Shield className="w-3.5 h-3.5" />
                      Blockchain
                    </span>
                  </div>
                </div>
                <p className="text-sm opacity-65">{t('inspiredBy')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────── */}
      <section className="py-16" id="how" aria-label="How EcoReturn works">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-black mb-2" style={{ letterSpacing: '-0.02em' }}>{t('howTitle')}</h2>
            <p className="opacity-75">{t('howSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: '1', title: t('step1Title'), text: t('step1Text') },
              { n: '2', title: t('step2Title'), text: t('step2Text') },
              { n: '3', title: t('step3Title'), text: t('step3Text') },
            ].map(s => (
              <div key={s.n} className="feature-card">
                <div className="feature-icon mb-3">{s.n}</div>
                <h3 className="font-extrabold text-lg mb-2">{s.title}</h3>
                <p className="opacity-75 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Refund policy ─────────────────────────── */}
      <section className="py-16" style={{ background: 'var(--eco-accent)' }} id="refund-policy">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-black mb-2" style={{ letterSpacing: '-0.02em' }}>{t('refundTitle')}</h2>
            <p className="opacity-75">{t('refundSubtitle')}</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="panel">
              <h3 className="font-extrabold text-lg mb-2">{t('barcodeRulesTitle')}</h3>
              <p className="opacity-75 text-sm mb-4">{t('barcodeRulesDesc')}</p>
              <ul className="list-disc pl-5 space-y-2 text-sm opacity-80">
                <li>Refund allowed only with readable barcode + EcoReturn symbol.</li>
                <li>Each barcode redeemable <strong>once only</strong> — duplicates rejected.</li>
                <li>Phone scanning checks uniqueness before approving.</li>
                <li>
                  <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--eco-primary)' }}>
                    <Shield className="w-3.5 h-3.5" /> Every scan is hashed on the blockchain.
                  </span>
                </li>
              </ul>
            </div>
            <div className="panel">
              <h3 className="font-extrabold text-lg mb-2">{t('refundValuesTitle')}</h3>
              <p className="opacity-75 text-sm mb-4">{t('refundValuesDesc')}</p>
              <ul className="list-disc pl-5 space-y-2 text-sm opacity-80">
                <li><strong>Old bottles (no barcode):</strong> 1 taka per 4 bottles.</li>
                <li><strong>Eligible bottles (barcode + symbol):</strong> 5 taka per bottle.</li>
                <li><strong>Deposit example:</strong> 20 taka drink + 5 taka deposit = 25 taka. Return bottle → get 5 taka back.</li>
              </ul>
              {/* Refund table */}
              <div className="mt-5 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-sm">
                  <thead style={{ background: 'rgba(46,125,50,0.08)' }}>
                    <tr>
                      <th className="text-left px-3 py-2 font-bold">Type</th>
                      <th className="text-right px-3 py-2 font-bold">Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: 'PET 500ml', val: '৳5' },
                      { type: 'PET 1L',    val: '৳7' },
                      { type: 'Glass',     val: '৳10' },
                      { type: 'Aluminium', val: '৳8' },
                      { type: 'Old (4x)',  val: '৳1' },
                    ].map((r, i) => (
                      <tr key={r.type} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                        <td className="px-3 py-2">{r.type}</td>
                        <td className="px-3 py-2 text-right font-bold" style={{ color: 'var(--eco-primary)' }}>{r.val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Audience ──────────────────────────────── */}
      <section className="py-16" id="audience">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-black mb-2" style={{ letterSpacing: '-0.02em' }}>{t('audienceTitle')}</h2>
            <p className="opacity-75">{t('audienceSubtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: t('students'),         text: t('studentsText') },
              { title: t('shopOwners'),        text: t('shopOwnersText') },
              { title: t('recyclingWorkers'), text: t('recyclingWorkersText') },
              { title: t('everyone'),          text: t('everyoneText') },
            ].map(a => (
              <div key={a.title} className="panel">
                <div className="font-extrabold text-base mb-1" style={{ color: 'var(--eco-primary)' }}>{a.title}</div>
                <div className="text-sm opacity-75">{a.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="py-16" id="get-started">
        <div className="max-w-6xl mx-auto px-4">
          <div className="cta-banner flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black mb-1" style={{ letterSpacing: '-0.02em' }}>{t('ctaTitle')}</h2>
              <p className="opacity-90 text-sm">{t('ctaText')}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/locations" className="flex items-center gap-2 bg-white text-eco-primary font-bold px-5 py-2.5 rounded-full hover:bg-gray-50 transition no-underline text-sm">
                <MapPin className="w-4 h-4" />
                {t('findMachine')}
              </Link>
              <Link href="/redeem" className="flex items-center gap-2 bg-transparent border-2 border-white text-white font-bold px-5 py-2.5 rounded-full hover:bg-white/10 transition no-underline text-sm">
                {t('redeemToken')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
