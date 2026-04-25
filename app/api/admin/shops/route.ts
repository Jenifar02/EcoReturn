/**
 * app/api/admin/shops/route.ts
 * GET  /api/admin/shops        — list all shop profiles
 * PATCH /api/admin/shops       — approve / suspend a shop
 *
 * PATCH body: { shopId: string, action: 'approve' | 'suspend' | 'pending' }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') return null
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const url    = new URL(req.url)
  const status = url.searchParams.get('status') ?? undefined
  const page   = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
  const limit  = 20

  const where: any = {}
  if (status) where.status = status

  const [shops, total] = await Promise.all([
    prisma.shopProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { redemptions: true } },
      },
    }),
    prisma.shopProfile.count({ where }),
  ])

  return NextResponse.json({ shops, total, page, limit })
}

const patchSchema = z.object({
  shopId: z.string(),
  action: z.enum(['approve', 'suspend', 'pending']),
})

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const body   = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { shopId, action } = parsed.data
  const statusMap = { approve: 'APPROVED', suspend: 'SUSPENDED', pending: 'PENDING' } as const

  const shop = await prisma.shopProfile.update({
    where: { id: shopId },
    data: {
      status: statusMap[action],
      approvedAt: action === 'approve' ? new Date() : undefined,
    },
    include: { user: { select: { name: true, email: true } } },
  })

  // Also update user role if approved
  if (action === 'approve') {
    await prisma.user.update({
      where: { id: shop.userId },
      data: { role: 'SHOP_OWNER' },
    })
  } else if (action === 'suspend') {
    await prisma.user.update({
      where: { id: shop.userId },
      data: { role: 'USER' },
    })
  }

  return NextResponse.json({ shop, message: `Shop ${action}d successfully.` })
}
