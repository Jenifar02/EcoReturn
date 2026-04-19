'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKey } from '@/lib/i18n'

// ─── Language Context ─────────────────────────────────
interface LangContextType {
  lang: Language
  t: (key: TranslationKey) => string
  toggleLang: () => void
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  t: (key) => key,
  toggleLang: () => {},
})

// ─── Theme Context ────────────────────────────────────
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
})

// ─── Combined Provider ────────────────────────────────
export function AppProviders({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Restore saved preferences
    const savedLang = localStorage.getItem('eco-lang') as Language | null
    if (savedLang && (savedLang === 'en' || savedLang === 'bn')) {
      setLang(savedLang)
    }

    const savedTheme = localStorage.getItem('eco-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        setTheme('dark')
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const toggleLang = () => {
    const next: Language = lang === 'en' ? 'bn' : 'en'
    setLang(next)
    localStorage.setItem('eco-lang', next)
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('eco-theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const t = (key: TranslationKey): string => {
    return translations[lang][key] ?? translations.en[key] ?? key
  }

  if (!mounted) {
    // Prevent hydration mismatch
    return (
      <LangContext.Provider value={{ lang: 'en', t: (k) => translations.en[k] ?? k, toggleLang: () => {} }}>
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {} }}>
          {children}
        </ThemeContext.Provider>
      </LangContext.Provider>
    )
  }

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
export const useTheme = () => useContext(ThemeContext)
