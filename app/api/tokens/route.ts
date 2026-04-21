/**
 * app/api/tokens/route.ts  — UPDATED with Commit-Reveal Security
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { buildRecord, broadcastToChain, BlockchainPayload } from '@/lib/blockchain'
import { generateTokenCode, hashTokenCode, getCodePrefix } from '@/lib/tokenSecurity'
import { z } from 'zod'
 
const schema = z.object({
  bottles: z.array(z.object({
    barcode:     z.string(),
    bottleType:  z.string(),
    refundValue: z.number(),
  })).min(1),
})
 
// ── POST: Generate a new token ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
 
  const userId = (session.user as any).id
  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
 
  const { bottles }   = parsed.data
  const totalAmount   = bottles.reduce((s, b) => s + b.refundValue, 0)
 
  // ── COMMIT-REVEAL: generate code, compute hash, NEVER store plaintext ──
  const plaintextCode = generateTokenCode()
  const codeHash      = hashTokenCode(plaintextCode)
  const codePrefix    = getCodePrefix(plaintextCode)
  // ─────────────────────────────────────────────────────────────────────
 
  try {
    // Check for duplicate barcodes
    const existing = await prisma.bottleScan.findMany({
      where:  { barcode: { in: bottles.map(b => b.barcode) } },
      select: { barcode: true },
    })
    if (existing.length > 0) {
      return NextResponse.json({
        error: `Duplicate barcodes: ${existing.map(e => e.barcode).join(', ')}`
      }, { status: 409 })
    }
 
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
 
    const token = await prisma.token.create({
      data: {
        codeHash,
        codePrefix,
        userId,
        totalBottles: bottles.length,
        totalAmount,
        expiresAt,
        bottles: {
          create: bottles.map(b => ({
            barcode:     b.barcode,
            bottleType:  b.bottleType,
            refundValue: b.refundValue,
            userId,
          })),
        },
      },
      include: { bottles: true },
    })
 
    const payload: BlockchainPayload = {
      type:      'TOKEN',
      id:        token.id,
      userId,
      data: {
        codeHash,
        bottles:     bottles.length,
        totalAmount,
        expiresAt:   expiresAt.toISOString()
      },
      timestamp: new Date().toISOString(),
    }
    const { hash } = buildRecord(payload)
    const txHash   = await broadcastToChain(payload)
 
    await prisma.token.update({
      where: { id: token.id },
      data:  { blockchainHash: txHash || hash },
    })
 
    await prisma.blockchainRecord.create({
      data: {
        entityType: 'token',
        entityId:   token.id,
        txHash:     txHash || hash,
        data:       payload as any,
      },
    })
 
    return NextResponse.json({
      token:          plaintextCode,
      codePrefix,
      totalAmount,
      blockchainHash: txHash || hash,
      expiresAt:      expiresAt.toISOString(),
      warning:        'এই code টি save করুন। এটি আর দেখানো হবে না।',
    }, { status: 201 })
 
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
 
// ── GET: fetch user's tokens (NO plaintext code returned) ─────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
 
  const userId = (session.user as any).id
  const tokens = await prisma.token.findMany({
    where:   { userId },
    include: { bottles: true, redemption: true },
    orderBy: { createdAt: 'desc' },
    take:    20,
  })
 
  // codeHash client-এ পাঠানো হবে না
  const safeTokens = tokens.map(({ codeHash, ...token }) => token)
 
  return NextResponse.json({ tokens: safeTokens })
}
