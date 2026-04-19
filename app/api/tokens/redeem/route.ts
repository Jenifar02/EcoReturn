import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildRecord, broadcastToChain, BlockchainPayload } from '@/lib/blockchain'
import { z } from 'zod'

const schema = z.object({
  code:   z.string().min(1),
  phone:  z.string().optional(),
  method: z.enum(['cash', 'bkash', 'nagad']).optional(),
})

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { code, phone, method = 'cash' } = parsed.data

  const token = await prisma.token.findUnique({
    where: { code: code.trim() },
  })
  if (!token)                      return NextResponse.json({ error: 'Token not found' },     { status: 404 })
  if (token.status === 'REDEEMED') return NextResponse.json({ error: 'Already redeemed' },   { status: 409 })
  if (token.status === 'EXPIRED')  return NextResponse.json({ error: 'Token expired' },       { status: 410 })
  if (new Date(token.expiresAt) < new Date()) {
    await prisma.token.update({ where: { id: token.id }, data: { status: 'EXPIRED' } })
    return NextResponse.json({ error: 'Token expired' }, { status: 410 })
  }

  // Build blockchain record for redemption
  const payload: BlockchainPayload = {
    type:      'REDEMPTION',
    id:        token.id,
    userId:    token.userId,
    data:      { code, amount: token.totalAmount, method, phone, redeemedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
  }
  const { hash } = buildRecord(payload)
  const txHash   = await broadcastToChain(payload)
  const finalHash = txHash || hash

  // Update token + create redemption record
  await prisma.$transaction([
    prisma.token.update({
      where: { id: token.id },
      data:  { status: 'REDEEMED', redeemedAt: new Date() },
    }),
    prisma.redemption.create({
      data: {
        tokenId:        token.id,
        userId:         token.userId,
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
    blockchainHash: finalHash,
  })
}
