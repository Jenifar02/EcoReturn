import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ManualClient from '@/components/ManualClient'

export default function ManualPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <ManualClient />
      </main>
      <Footer />
    </>
  )
}
