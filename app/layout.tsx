import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/lib/providers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SessionProvider } from '@/components/SessionProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EcoReturn — Recycle Smart, Earn Green',
  description: "Bangladesh's smart bottle return and refund system. Inspired by Germany's Pfand system.",
  themeColor: '#2e7d32',
  keywords: ['EcoReturn', 'bottle return', 'Bangladesh', 'recycle', 'plastic', 'environment'],
  openGraph: {
    title: 'EcoReturn — Recycle Smart, Earn Green',
    description: "Bangladesh's smart bottle return and refund system",
    type: 'website',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} font-sans transition-colors duration-300`}
        style={{
          background: 'var(--eco-accent)',
          color: 'var(--eco-text)',
        }}
      >
        <SessionProvider session={session}>
          <AppProviders>
            <a className="skip-link" href="#main-content">Skip to content</a>
            {children}
          </AppProviders>
        </SessionProvider>
      </body>
    </html>
  )
}
