/**
 * app/api/admin/barcodes/route.ts
 *
 * GET  /api/admin/barcodes          — সব registered barcode list করে (admin only)
 * POST /api/admin/barcodes          — batch generate করে DB-তে save করে
 *
 * POST body:
 * {
 *   bottleType:  "PET 500ml" | "PET 1L" | "Glass" | "Aluminium"
 *   count:       number (1–500)
 *   brand?:      string
 * }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// ── EAN-13 generate helper ──────────────────────────────────────────────
// EAN-13: 12 digit random + 1 check digit
function generateEAN13(): string {
  // Bangladesh prefix: 471 (dummy — real GS1 prefix আলাদা হবে)
  const prefix = '471'
  const middle = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('')
  const body   = prefix + middle                    // 12 digits

  // Check digit calculation (standard EAN-13)
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(body[i]) * (i % 2 === 0 ? 1 : 3)
  }
  const check = (10 - (sum % 10)) % 10
  return body + check
}

// Collision-safe batch generator
async function generateUniqueBarcodes(count: number): Promise<string[]> {
  const barcodes = new Set<string>()

  while (barcodes.size < count) {
    const candidate = generateEAN13()
    barcodes.add(candidate)
  }

  const candidates = [...barcodes]

  // DB-তে কোনোটা already আছে কিনা check করো
  const existing = await prisma.registeredBarcode.findMany({
    where:  { barcode: { in: candidates } },
    select: { barcode: true },
  })
  const existingSet = new Set(existing.map(e => e.barcode))

  const unique = candidates.filter(b => !existingSet.has(b))

  // যদি collision থাকে, আবার generate করো
  if (unique.length < count) {
    const extra = await generateUniqueBarcodes(count - unique.length)
    return [...unique, ...extra]
  }

  return unique
}

// ── Validation ──────────────────────────────────────────────────────────
const BOTTLE_TYPES = ['PET 500ml', 'PET 1L', 'Glass', 'Aluminium'] as const

const REFUND_MAP: Record<string, number> = {
  'PET 500ml': 5,
  'PET 1L':    7,
  'Glass':     10,
  'Aluminium': 8,
}

const generateSchema = z.object({
  bottleType: z.enum(BOTTLE_TYPES),
  count:      z.number().int().min(1).max(500),
  brand:      z.string().max(80).optional(),
})

// ── Admin role guard ────────────────────────────────────────────────────
async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  if ((session.user as any).role !== 'ADMIN') return null
  return session
}

// ── GET: list all barcodes ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const url    = new URL(req.url)
  const type   = url.searchParams.get('type') ?? undefined
  const used   = url.searchParams.get('used')
  const page   = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
  const limit  = 50

  const where: any = {}
  if (type)          where.bottleType = type
  if (used === '0')  where.isUsed = false
  if (used === '1')  where.isUsed = true

  const [barcodes, total] = await Promise.all([
    prisma.registeredBarcode.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.registeredBarcode.count({ where }),
  ])

  return NextResponse.json({ barcodes, total, page, limit })
}

// ── POST: batch generate ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = generateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { bottleType, count, brand } = parsed.data
  const refundValue = REFUND_MAP[bottleType]

  try {
    const barcodes = await generateUniqueBarcodes(count)

    await prisma.registeredBarcode.createMany({
      data: barcodes.map(barcode => ({
        barcode,
        bottleType,
        refundValue,
        brand: brand ?? null,
      })),
    })

    return NextResponse.json({
      generated: count,
      bottleType,
      refundValue,
      barcodes,              // client CSV download এর জন্য
      message:  `${count}টি ${bottleType} barcode সফলভাবে generate হয়েছে।`,
    }, { status: 201 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
