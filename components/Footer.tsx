'use client'

import Link from 'next/link'
import { useLang } from '@/lib/providers'
import { Recycle, Shield, Leaf } from 'lucide-react'

export default function Footer() {
  const { t } = useLang()

  return (
    <footer className="site-footer mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand col */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="brand-mark flex items-center justify-center w-8 h-8">
                <Recycle className="w-4 h-4 text-white" style={{margin:'auto'}} />
              </div>
              <span className="font-black text-lg tracking-tight">EcoReturn</span>
            </div>
            <p className="text-sm opacity-70 max-w-xs">
              Bangladesh's smart bottle return system. Inspired by Germany's Pfand — built for us.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Shield className="w-4 h-4 text-eco-primary dark:text-eco-highlight" />
              <span className="text-xs font-bold text-eco-primary dark:text-eco-highlight">Blockchain Secured</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="font-black mb-3 text-sm uppercase tracking-wider opacity-60">Pages</div>
            <ul className="flex flex-col gap-2 list-none m-0 p-0">
              {[
                { href: '/',          label: t('home') },
                { href: '/how',       label: t('howItWorks') },
                { href: '/locations', label: t('locations') },
                { href: '/scan',      label: t('scan') },
                { href: '/redeem',    label: t('redeem') },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm font-semibold opacity-80 hover:opacity-100 hover:text-eco-primary dark:hover:text-eco-highlight no-underline transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <div className="font-black mb-3 text-sm uppercase tracking-wider opacity-60">Account</div>
            <ul className="flex flex-col gap-2 list-none m-0 p-0">
              {[
                { href: '/login',     label: t('signIn') },
                { href: '/signup',    label: t('signUp') },
                { href: '/dashboard', label: t('dashboard') },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm font-semibold opacity-80 hover:opacity-100 hover:text-eco-primary dark:hover:text-eco-highlight no-underline transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Impact */}
          <div>
            <div className="font-black mb-3 text-sm uppercase tracking-wider opacity-60">Impact</div>
            <div className="flex items-start gap-2 mb-2">
              <Leaf className="w-4 h-4 text-eco-primary dark:text-eco-highlight mt-0.5 flex-shrink-0" />
              <span className="text-sm opacity-75">Reducing plastic waste across Bangladesh one bottle at a time.</span>
            </div>
            <div className="text-xs opacity-50 mt-4">
              Modelled after Germany's Pfandsystem (deposit refund system).
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/6 dark:border-white/6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-sm opacity-60">© {new Date().getFullYear()} EcoReturn Bangladesh. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-60">Made in 🇧🇩 Bangladesh</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-eco-highlight animate-pulse"></div>
              <span className="text-xs font-bold text-eco-primary dark:text-eco-highlight">System online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
