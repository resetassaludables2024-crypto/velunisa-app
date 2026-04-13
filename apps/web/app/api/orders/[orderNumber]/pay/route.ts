import { NextRequest, NextResponse } from 'next/server'
import { prisma }         from '@/lib/db'
import { chargeCard }     from '@/lib/paymentez'
import { z }              from 'zod'
import { sendPaymentConfirmedEmail } from '@/lib/email'
import { sendPaymentConfirmed }      from '@/lib/whatsapp'
import { sendOrderStatusPush }       from '@/lib/push'

const Schema = z.object({
  /** Token de tarjeta generado por Paymentez.js en el cliente */
  cardToken: z.string().min(5),
  /** Email del comprador (para asociar al usuario en Paymentez) */
  email:     z.string().email(),
})

/**
 * POST /api/orders/[orderNumber]/pay
 * Procesa un pago con tarjeta via Paymentez.
 * El token de tarjeta fue creado por Paymentez.js en el cliente (never pasan datos de tarjeta por nuestro server).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const body   = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where:   { orderNumber: params.orderNumber.toUpperCase() },
    include: { user: true, items: true },
  })
  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }
  if (order.paymentStatus === 'CONFIRMED') {
    return NextResponse.json({ error: 'Este pedido ya fue pagado' }, { status: 409 })
  }

  const total       = parseFloat(order.total.toString())
  const addr        = order.shippingAddress as unknown as Record<string, string>
  const firstName   = addr?.firstName ?? 'Cliente'
  const userId      = order.userId ?? parsed.data.email  // Paymentez user ID
  const userEmail   = parsed.data.email

  // Cobrar con Paymentez
  const result = await chargeCard({
    cardToken:    parsed.data.cardToken,
    userEmail,
    userId,
    amount:       total,
    description:  `Velunisa — Pedido ${order.orderNumber}`,
    devReference: order.orderNumber,
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.message ?? 'Pago rechazado. Verifica los datos de tu tarjeta.' },
      { status: 402 }
    )
  }

  // Pago aprobado → actualizar pedido + decrementar stock (transacción atómica)
  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus:  'CONFIRMED',
        status:         'PROCESSING',
        confirmedAt:    new Date(),
        bankTransferRef: result.transactionId ?? undefined,  // reuse field for txn ID
        notes: `Paymentez TXN: ${result.transactionId} | Auth: ${result.authCode}`,
      },
    }),
    ...order.items.map(item =>
      prisma.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity } },
      })
    ),
  ])

  // Notificaciones (non-blocking)
  const email = order.user?.email ?? order.guestEmail ?? userEmail
  const phone = addr?.phone ?? order.guestPhone

  if (email) {
    sendPaymentConfirmedEmail({ to: email, orderNumber: order.orderNumber, firstName })
      .catch(console.error)
  }
  if (phone) {
    sendPaymentConfirmed(phone, order.orderNumber)
      .catch(console.error)
  }
  if (order.user?.expoPushToken) {
    sendOrderStatusPush({
      expoPushToken: order.user.expoPushToken,
      orderNumber:   order.orderNumber,
      status:        'CONFIRMED',
    }).catch(console.error)
  }

  return NextResponse.json({
    data: {
      orderNumber:   updated.orderNumber,
      status:        updated.status,
      transactionId: result.transactionId,
      authCode:      result.authCode,
    },
  })
}
