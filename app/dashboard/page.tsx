
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DashboardClient from '@/components/DashboardClient'
import AdminDashboardClient from '@/components/AdminDashboardClient'
import ShopPanelClient from '@/components/ShopPanelClient'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const role = (session.user as any).role

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        {role === 'ADMIN'      && <AdminDashboardClient />}
        {role === 'SHOP_OWNER' && <ShopPanelClient />}
        {role === 'USER'       && <DashboardClient />}
      </main>
      <Footer />
    </>
  )
}
