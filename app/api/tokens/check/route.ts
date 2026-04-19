import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Token code required' }, { status: 400 })

  const normalized = code.trim().toUpperCase()

  const token = await prisma.token.findFirst({
    where: {
      OR: [
        { code: normalized },
        { code: code.trim() },
      ]
    },
    select: {
      code: true, status: true, totalAmount: true,
      totalBottles: true, blockchainHash: true,
      createdAt: true, expiresAt: true,
    },
  })

  if (!token) return NextResponse.json({ error: 'Token not found' }, { status: 404 })

  // Auto-expire check
  if (token.status === 'PENDING' && new Date(token.expiresAt) < new Date()) {
    await prisma.token.update({ where: { code: token.code }, data: { status: 'EXPIRED' } })
    return NextResponse.json({ token: { ...token, status: 'EXPIRED' } })
  }

  return NextResponse.json({ token })
}
