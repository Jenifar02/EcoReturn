import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScanClient from '@/components/ScanClient'

export default function ScanPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <ScanClient />
      </main>
      <Footer />
    </>
  )
}
