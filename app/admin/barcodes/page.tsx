import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AdminBarcodesClient from '@/components/AdminBarcodesClient'

export default function AdminBarcodesPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <AdminBarcodesClient />
      </main>
      <Footer />
    </>
  )
}
