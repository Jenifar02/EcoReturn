/**
 * app/api/shop/register/route.ts
 * POST /api/shop/register — Shop owner applies for registration
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  shopName: z.string().min(2).max(100),
  area:     z.string().min(2).max(100),
  district: z.string().min(2).max(60),
  phone:    z.string().min(11).max(15),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  // Check if already registered
  const existing = await prisma.shopProfile.findUnique({ where: { userId } })
  if (existing) {
    return NextResponse.json(
      { error: 'Already registered', status: existing.status },
      { status: 409 }
    )
  }

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const shop = await prisma.shopProfile.create({
    data: {
      userId,
      shopName: parsed.data.shopName,
      area:     parsed.data.area,
      district: parsed.data.district,
      phone:    parsed.data.phone,
      status:   'PENDING',
    },
  })

  return NextResponse.json({
    shop,
    message: 'নিবন্ধন সম্পন্ন! Admin অনুমোদনের জন্য অপেক্ষা করুন।',
  }, { status: 201 })
}
