/**
 * app/api/admin/stats/route.ts
 * GET /api/admin/stats — Admin-only dashboard stats
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') return null
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const [
    totalUsers,
    totalShops,
    pendingShops,
    totalTokens,
    redeemedTokens,
    totalBottles,
    totalAmountResult,
    recentUsers,
    recentRedemptions,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.shopProfile.count(),
    prisma.shopProfile.count({ where: { status: 'PENDING' } }),
    prisma.token.count(),
    prisma.token.count({ where: { status: 'REDEEMED' } }),
    prisma.bottleScan.count(),
    prisma.redemption.aggregate({ _sum: { amount: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.redemption.findMany({
      orderBy: { redeemedAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true } },
        shopProfile: { select: { shopName: true } },
      },
    }),
  ])

  return NextResponse.json({
    stats: {
      totalUsers,
      totalShops,
      pendingShops,
      totalTokens,
      redeemedTokens,
      totalBottles,
      totalAmountRedeemed: totalAmountResult._sum.amount ?? 0,
    },
    recentUsers,
    recentRedemptions,
  })
}
