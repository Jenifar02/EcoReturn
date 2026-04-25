import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ShopPanelClient from '@/components/ShopPanelClient'

export default async function ShopPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  return <ShopPanelClient />
}
