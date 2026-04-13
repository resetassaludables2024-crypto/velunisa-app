import { NextRequest, NextResponse }  from 'next/server'
import { getServerSession }           from 'next-auth'
import { authOptions }                from '@/lib/auth'
import { prisma }                     from '@/lib/db'
import { z }                          from 'zod'
import { sendOrderShippedEmail }      from '@/lib/email'
import { sendShippingUpdate }         from '@/lib/whatsapp'
import { sendOrderStatusPush }        from '@/lib/push'

const Schema = z.object({
  status:       z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingCode: z.string().optional(),
  carrier:      z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const order = await prisma.order.findUnique({
    where:   { orderNumber: params.orderNumber },
    include: { user: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const wasShipped = order.status !== 'SHIPPED' && parsed.data.status === 'SHIPPED'

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: parsed.data.status,
      ...(wasShipped && parsed.data.trackingCode ? { trackingCode: parsed.data.trackingCode } : {}),
      ...(wasShipped && parsed.data.carrier      ? { carrier:      parsed.data.carrier }      : {}),
      ...(parsed.data.status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
    },
  })

  // Notify customer — email + WhatsApp + push (all non-blocking)
  const email     = order.user?.email ?? order.guestEmail
  const phone     = (order.shippingAddress as unknown as any)?.phone ?? order.guestPhone
  const firstName = (order.shippingAddress as unknown as any)?.firstName ?? 'Cliente'
  const pushToken = order.user?.expoPushToken

  if (wasShipped) {
    if (email) {
      sendOrderShippedEmail({
        to:           email,
        orderNumber:  order.orderNumber,
        firstName,
        trackingCode: parsed.data.trackingCode,
        carrier:      parsed.data.carrier,
      }).catch(console.error)
    }
    if (phone) {
      sendShippingUpdate(phone, order.orderNumber, parsed.data.trackingCode)
        .catch(console.error)
    }
  }

  // Push notification for any meaningful status change
  if (pushToken && ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(parsed.data.status)) {
    sendOrderStatusPush({
      expoPushToken: pushToken,
      orderNumber:   order.orderNumber,
      status:        parsed.data.status,
      trackingCode:  parsed.data.trackingCode,
      carrier:       parsed.data.carrier,
    }).catch(console.error)
  }

  return NextResponse.json({ data: { status: updated.status } })
}
