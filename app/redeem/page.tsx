import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import RedeemClient from '@/components/RedeemClient'

export default function RedeemPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <RedeemClient />
      </main>
      <Footer />
    </>
  )
}
