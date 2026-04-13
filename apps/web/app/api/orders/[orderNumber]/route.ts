import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/db'

/**
 * GET /api/orders/[orderNumber]
 * Public — used by mobile app and confirmation page to look up an order.
 * Returns order status + items without sensitive payment details.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const order = await prisma.order.findUnique({
    where:   { orderNumber: params.orderNumber.toUpperCase() },
    include: { items: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  // Return only safe fields (no payment internal notes)
  return NextResponse.json({
    data: {
      id:          order.id,
      orderNumber: order.orderNumber,
      status:      order.status,
      paymentStatus: order.paymentStatus,
      total:       order.total,
      subtotal:    order.subtotal,
      shippingCost: order.shippingCost,
      createdAt:   order.createdAt,
      trackingCode: order.trackingCode,
      carrier:      order.carrier,
      items:        order.items.map(i => ({
        id:       i.id,
        name:     i.name,
        quantity: i.quantity,
        price:    i.price,
        image:    i.image,
      })),
    },
  })
}
