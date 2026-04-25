/**
 * app/api/shop/profile/route.ts
 * GET /api/shop/profile — get own shop profile & status
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const shop = await prisma.shopProfile.findUnique({
    where: { userId },
    include: {
      _count: { select: { redemptions: true } },
    },
  })

  if (!shop) return NextResponse.json({ shop: null })

  const totalEarned = await prisma.redemption.aggregate({
    where:  { shopId: shop.id },
    _sum:   { amount: true },
  })

  return NextResponse.json({
    shop,
    totalRedemptions: shop._count.redemptions,
    totalAmountProcessed: totalEarned._sum.amount ?? 0,
  })
}
