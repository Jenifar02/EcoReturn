/**
 * app/api/tokens/check/route.ts — UPDATED
 *
 * Public endpoint — lets shop owners verify a token WITHOUT redeeming it.
 * Accepts the plaintext code, hashes it, looks up by hash.
 * Returns safe info only (amount, bottles, status) — no user PII.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashTokenCode } from '@/lib/tokenSecurity'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.json({ error: 'Token code required' }, { status: 400 })
  }

  const submittedCode = code.trim().toUpperCase()
  const codeHash      = hashTokenCode(submittedCode)

  const token = await prisma.token.findUnique({
    where:  { codeHash },
    select: {
      codePrefix:     true,
      status:         true,
      totalAmount:    true,
      totalBottles:   true,
      blockchainHash: true,
      createdAt:      true,
      expiresAt:      true,
      // codeHash intentionally NOT returned
    },
  })

  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  }

  // Auto-expire check
  if (token.status === 'PENDING' && new Date(token.expiresAt) < new Date()) {
    await prisma.token.updateMany({
      where: { codeHash },
      data:  { status: 'EXPIRED' },
    })
    return NextResponse.json({ token: { ...token, status: 'EXPIRED' } })
  }

  return NextResponse.json({ token })
}
