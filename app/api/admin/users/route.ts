/**
 * app/api/admin/users/route.ts
 * GET /api/admin/users — Paginated user list (admin only)
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

  const url   = new URL(req.url)
  const page  = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
  const limit = 20
  const search = url.searchParams.get('q') ?? ''

  const where: any = {}
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, createdAt: true,
        _count: { select: { tokens: true, scans: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ users, total, page, limit })
}
