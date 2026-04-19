import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div
            className="text-8xl font-black mb-4"
            style={{ color: 'var(--eco-primary)', letterSpacing: '-0.04em', opacity: 0.15 }}
          >
            404
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ letterSpacing: '-0.02em' }}>
            Page not found
          </h1>
          <p className="opacity-60 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-eco px-6 py-2.5">
              Go home
            </Link>
            <Link href="/scan" className="btn-outline-eco px-6 py-2.5">
              Scan bottles
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
