import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <LoginForm />
      </main>
      <Footer />
    </>
  )
}
