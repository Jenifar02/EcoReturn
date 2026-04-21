/**
 * app/api/tokens/redeem/route.ts  — UPDATED with Commit-Reveal Verification
 *
 * Flow:
 *  1. Shop owner submits the plaintext code they received from customer
 *  2. Server hashes it with TOKEN_SECRET → looks up by codeHash
 *  3. If match found + status PENDING + not expired → redeem
 *  4. Plaintext code is never logged or stored
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { buildRecord, broadcastToChain, BlockchainPayload } from '@/lib/blockchain'
import { hashTokenCode } from '@/lib/tokenSecurity'
import { z } from 'zod'

const schema = z.object({
  code:   z.string().min(1),
  method: z.enum(['cash', 'bkash', 'nagad']).optional(),
})

export async function POST(req: NextRequest) {
  // Only SHOP_OWNER or ADMIN can redeem
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role   = (session.user as any).role
  const shopId = (session.user as any).id

  if (role !== 'SHOP_OWNER' && role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Only shop owners can redeem tokens' },
      { status: 403 }
    )
  }

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { code, method = 'cash' } = parsed.data
  const submittedCode = code.trim().toUpperCase()

  // ── REVEAL: hash the submitted code and look up by hash ──────────────
  const codeHash = hashTokenCode(submittedCode)

  const token = await prisma.token.findUnique({
    where: { codeHash },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  })
  // ─────────────────────────────────────────────────────────────────────

  // Generic error — don't reveal WHY it failed (security best practice)
  if (!token) {
    return NextResponse.json(
      { error: 'Invalid token code. Please check and try again.' },
      { status: 404 }
    )
  }

  if (token.status === 'REDEEMED') {
    return NextResponse.json(
      { error: 'This token has already been redeemed.' },
      { status: 409 }
    )
  }

  // Check expiry
  if (token.status === 'EXPIRED' || new Date(token.expiresAt) < new Date()) {
    await prisma.token.update({
      where: { id: token.id },
      data:  { status: 'EXPIRED' },
    })
    return NextResponse.json(
      { error: 'This token has expired.' },
      { status: 410 }
    )
  }

  // ── Get shop profile for the redeeming shop owner ─────────────────────
  const shopProfile = await prisma.shopProfile.findUnique({
    where:  { userId: shopId },
  })

  if (role === 'SHOP_OWNER' && (!shopProfile || shopProfile.status !== 'APPROVED')) {
    return NextResponse.json(
      { error: 'Your shop is not approved yet. Contact admin.' },
      { status: 403 }
    )
  }

  // ── Build blockchain record ───────────────────────────────────────────
  const payload: BlockchainPayload = {
    type:      'REDEMPTION',
    id:        token.id,
    userId:    token.userId,
    data: {
      codeHash,   // commit on-chain, NOT the plaintext
      amount:     token.totalAmount,
      method,
      shopId:     shopProfile?.id || 'admin',
      redeemedAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  }

  const { hash } = buildRecord(payload)
  const txHash   = await broadcastToChain(payload)
  const finalHash = txHash || hash

  // ── Atomic DB update ──────────────────────────────────────────────────
  await prisma.$transaction([
    prisma.token.update({
      where: { id: token.id },
      data:  { status: 'REDEEMED', redeemedAt: new Date() },
    }),
    prisma.redemption.create({
      data: {
        tokenId:        token.id,
        userId:         token.userId,
        shopId:         shopProfile?.id,
        amount:         token.totalAmount,
        method,
        blockchainHash: finalHash,
      },
    }),
    prisma.blockchainRecord.create({
      data: {
        entityType: 'redemption',
        entityId:   token.id,
        txHash:     finalHash,
        data:       payload as any,
      },
    }),
  ])

  return NextResponse.json({
    success:        true,
    amount:         token.totalAmount,
    totalBottles:   token.totalBottles,
    customerName:   token.user.name,
    blockchainHash: finalHash,
    message:        `৳${token.totalAmount} সফলভাবে redeem হয়েছে!`,
  })
}
