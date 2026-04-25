'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useLang, useTheme } from '@/lib/providers'
import { Moon, Sun, Globe, Menu, X, Recycle, LayoutDashboard, LogOut, Store } from 'lucide-react'
import clsx from 'clsx'

export default function Navbar() {
  const pathname = usePathname()
  const { t, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) => pathname === href

  const navLinks = [
    { href: '/',            label: t('home') },
    { href: '/how',         label: t('howItWorks') },
    { href: '/locations',   label: t('locations') },
    { href: '/scan',        label: t('scan') },
    { href: '/manual',      label: t('manual') },
    { href: '/redeem',      label: t('redeem') },
  ]

  return (
    <header className="site-header sticky top-0 z-50">
      <nav
        className={clsx(
          'navbar-glass py-3 px-4 transition-shadow',
          scrolled && 'shadow-eco'
        )}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-eco-text dark:text-eco-dark-text no-underline" style={{ letterSpacing: '-0.02em' }}>
            <div className="brand-mark flex items-center justify-content-center">
              <Recycle className="w-5 h-5 text-white m-auto" style={{margin:'auto'}} />
            </div>
            <span>EcoReturn</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1 list-none m-0 p-0">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={clsx(
                    'px-3 py-2 rounded-lg font-semibold text-sm transition-colors no-underline',
                    isActive(link.href)
                      ? 'text-eco-primary dark:text-eco-highlight'
                      : 'text-eco-text dark:text-eco-dark-text opacity-80 hover:opacity-100 hover:text-eco-primary dark:hover:text-eco-highlight'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-eco-primary/30 text-eco-primary dark:text-eco-highlight text-sm font-bold transition hover:bg-eco-primary/8 cursor-pointer"
              title="Toggle language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('language')}</span>
            </button>

            {/* Dark/Light toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full border border-eco-primary/30 flex items-center justify-center text-eco-primary dark:text-eco-highlight transition hover:bg-eco-primary/8 cursor-pointer"
              title={theme === 'dark' ? t('dayMode') : t('nightMode')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth buttons */}
            {session ? (
              <div className="hidden lg:flex items-center gap-2">
                {(session.user as any)?.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" className="btn-outline-eco text-sm py-2 px-4">
                    Admin
                  </Link>
                )}
                {((session.user as any)?.role === 'SHOP_OWNER' || (session.user as any)?.role === 'ADMIN') && (
                  <Link href="/shop" className="btn-outline-eco text-sm py-2 px-4">
                    <Store className="w-3.5 h-3.5" />
                    Shop
                  </Link>
                )}
                <Link href="/dashboard" className="btn-outline-eco text-sm py-2 px-4">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t('dashboard')}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="btn-eco text-sm py-2 px-4"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('signOut')}
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/signup" className="btn-outline-eco text-sm py-2 px-4">{t('signUp')}</Link>
                <Link href="/login"  className="btn-eco text-sm py-2 px-4">{t('signIn')}</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg border border-eco-primary/30 flex items-center justify-center text-eco-primary dark:text-eco-highlight cursor-pointer"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden mt-3 px-4 pb-4 border-t border-black/6 dark:border-white/6 pt-3">
            <ul className="flex flex-col gap-1 list-none m-0 p-0 mb-3">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={clsx(
                      'block px-3 py-2.5 rounded-lg font-semibold text-sm no-underline transition-colors',
                      isActive(link.href)
                        ? 'bg-eco-primary/10 text-eco-primary dark:text-eco-highlight'
                        : 'text-eco-text dark:text-eco-dark-text hover:bg-eco-primary/5'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 flex-wrap">
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn-outline-eco text-sm py-2 px-4 flex-1">
                    {t('dashboard')}
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-eco text-sm py-2 px-4 flex-1">
                    {t('signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-outline-eco text-sm py-2 px-4 flex-1 text-center">{t('signUp')}</Link>
                  <Link href="/login"  onClick={() => setMenuOpen(false)} className="btn-eco text-sm py-2 px-4 flex-1 text-center">{t('signIn')}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
