import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SignupForm from '@/components/SignupForm'

export default function SignupPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <SignupForm />
      </main>
      <Footer />
    </>
  )
}
