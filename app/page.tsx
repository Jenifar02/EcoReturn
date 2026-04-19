import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomePage from '@/components/HomePage'

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="site-main min-h-screen">
        <HomePage />
      </main>
      <Footer />
    </>
  )
}
