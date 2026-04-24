/**
 * app/api/barcodes/lookup/route.ts
 * GET /api/barcodes/lookup?code=XXXX
 * Scan করা barcode DB-তে check করে bottle type + refund value return করে।
 * Authenticated user হলেই access পাবে।
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const code = req.nextUrl.searchParams.get('code')?.trim()
  if (!code) {
    return NextResponse.json({ error: 'code parameter required' }, { status: 400 })
  }

  // DB-তে registered barcode আছে কিনা দেখো
  const registered = await prisma.registeredBarcode.findUnique({
    where: { barcode: code },
  })

  if (!registered) {
    return NextResponse.json({ found: false }, { status: 404 })
  }

  if (registered.isUsed) {
    return NextResponse.json({
      found:   true,
      isUsed:  true,
      error:   'এই barcode টি আগেই ব্যবহার করা হয়েছে।',
    }, { status: 409 })
  }

  return NextResponse.json({
    found:       true,
    isUsed:      false,
    barcode:     registered.barcode,
    bottleType:  registered.bottleType,
    refundValue: registered.refundValue,
    brand:       registered.brand ?? null,
  })
}
