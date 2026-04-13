import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/db'
import { sendPaymentConfirmed }      from '@/lib/whatsapp'
import { sendPaymentConfirmedEmail } from '@/lib/email'
import { sendOrderStatusPush }       from '@/lib/push'

export async function POST(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await prisma.order.findUnique({
    where:   { orderNumber: params.orderNumber },
    include: { user: true, items: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (order.paymentStatus === 'CONFIRMED') {
    return NextResponse.json({ error: 'Order already confirmed' }, { status: 409 })
  }

  // Update order status + decrement stock in a transaction
  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'CONFIRMED',
        status:        'PROCESSING',
        confirmedAt:   new Date(),
      },
    }),
    ...order.items.map(item =>
      prisma.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity } },
      })
    ),
  ])

  // Notify customer
  const addr      = order.shippingAddress as unknown as Record<string, string>
  const email     = order.user?.email ?? order.guestEmail
  const phone     = addr?.phone ?? order.guestPhone
  const firstName = addr?.firstName ?? 'Cliente'

  if (email) {
    sendPaymentConfirmedEmail({ to: email, orderNumber: order.orderNumber, firstName })
      .catch(console.error)
  }
  if (phone) {
    sendPaymentConfirmed(phone, order.orderNumber)
      .catch(console.error)
  }

  // Mobile push notification
  if (order.user?.expoPushToken) {
    sendOrderStatusPush({
      expoPushToken: order.user.expoPushToken,
      orderNumber:   order.orderNumber,
      status:        'CONFIRMED',
    }).catch(console.error)
  }

  return NextResponse.json({ data: { orderNumber: updated.orderNumber, status: updated.status } })
}
