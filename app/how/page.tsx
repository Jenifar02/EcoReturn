import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HowClient from '@/components/HowClient'

export default function HowPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <HowClient />
      </main>
      <Footer />
    </>
  )
}
