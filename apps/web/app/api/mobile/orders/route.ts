import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/mobile/orders?userId=<id>
 * Returns the last 20 orders for a registered user.
 * Authenticated by userId (stored in AsyncStorage after login).
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
  }

  const orders = await prisma.order.findMany({
    where:   { userId },
    include: { items: { select: { id: true, name: true, quantity: true, price: true, image: true } } },
    orderBy: { createdAt: 'desc' },
    take:    20,
  })

  return NextResponse.json({
    data: orders.map(o => ({
      id:          o.id,
      orderNumber: o.orderNumber,
      status:      o.status,
      paymentStatus: o.paymentStatus,
      total:       o.total,
      createdAt:   o.createdAt,
      trackingCode: o.trackingCode,
      items:       o.items,
    })),
  })
}
