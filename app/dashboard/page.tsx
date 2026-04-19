import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DashboardClient from '@/components/DashboardClient'

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <DashboardClient />
      </main>
      <Footer />
    </>
  )
}
