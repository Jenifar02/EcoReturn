import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LocationsClient from '@/components/LocationsClient'

export default function LocationsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <LocationsClient />
      </main>
      <Footer />
    </>
  )
}
