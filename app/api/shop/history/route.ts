/**
 * app/api/shop/history/route.ts
 * GET /api/shop/history — shop's redemption history
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role   = (session.user as any).role
  const userId = (session.user as any).id

  if (role !== 'SHOP_OWNER' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Shop owner only' }, { status: 403 })
  }

  const shopProfile = await prisma.shopProfile.findUnique({ where: { userId } })
  if (!shopProfile) return NextResponse.json({ error: 'Shop profile not found' }, { status: 404 })

  const url   = new URL(req.url)
  const page  = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
  const limit = 20

  const [redemptions, total] = await Promise.all([
    prisma.redemption.findMany({
      where:   { shopId: shopProfile.id },
      orderBy: { redeemedAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        user:  { select: { name: true, phone: true } },
        token: { select: { totalBottles: true, codePrefix: true } },
      },
    }),
    prisma.redemption.count({ where: { shopId: shopProfile.id } }),
  ])

  return NextResponse.json({ redemptions, total, page, limit })
}
