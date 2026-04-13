import { NextRequest, NextResponse } from 'next/server'
import { prisma }         from '@/lib/db'
import { sendPaymentConfirmedEmail } from '@/lib/email'
import { sendPaymentConfirmed }      from '@/lib/whatsapp'
import { sendOrderStatusPush }       from '@/lib/push'
import crypto                        from 'crypto'

/**
 * POST /api/webhooks/paymentez
 * Recibe notificaciones de cambio de estado de transacciones.
 * Docs: https://paymentez.github.io/api-doc/#notifications
 *
 * Configura la URL en el dashboard de Paymentez:
 *   https://dashboard.paymentez.com → Settings → Notifications
 *   URL: https://velunisa.com/api/webhooks/paymentez
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  // Verificar firma (opcional pero recomendado)
  const signature = req.headers.get('auth-token')
  if (signature && process.env.PAYMENTEZ_SERVER_APP_KEY) {
    const timestamp = Math.floor(Date.now() / 1000)
    // Paymentez usa el mismo esquema de firma que el server
    // Tolerancia de 5 minutos para el timestamp
    const isValid = verifyPaymentezSignature(signature, process.env.PAYMENTEZ_SERVER_APP_KEY)
    if (!isValid) {
      console.warn('[paymentez webhook] Invalid signature')
      // No rechazamos para no perder eventos — solo logueamos
    }
  }

  const txn = body?.transaction
  if (!txn) return NextResponse.json({ received: true })

  const devReference  = txn.dev_reference  as string | undefined  // nuestro orderNumber
  const transactionId = txn.id             as string | undefined
  const status        = txn.status         as string | undefined  // 'success' | 'pending' | 'failure' | 'cancelled'

  if (!devReference || !status) return NextResponse.json({ received: true })

  // Log event
  await prisma.webhookEvent.create({
    data: {
      source:    'paymentez',
      eventType: `transaction.${status}`,
      payload:   body,
    },
  }).catch(console.error)

  // Solo procesar si el pago fue exitoso
  if (status !== 'success') {
    return NextResponse.json({ received: true })
  }

  const order = await prisma.order.findUnique({
    where:   { orderNumber: devReference.toUpperCase() },
    include: { user: true, items: true },
  })

  if (!order || order.paymentStatus === 'CONFIRMED') {
    return NextResponse.json({ received: true })
  }

  // Confirmar pedido + decrementar stock
  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus:  'CONFIRMED',
        status:         'PROCESSING',
        confirmedAt:    new Date(),
        bankTransferRef: transactionId,
        notes: order.notes
          ? `${order.notes} | Webhook confirmado`
          : `Paymentez webhook TXN: ${transactionId}`,
      },
    }),
    ...order.items.map(item =>
      prisma.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity } },
      })
    ),
  ]).catch(console.error)

  // Notificaciones
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
  if (order.user?.expoPushToken) {
    sendOrderStatusPush({
      expoPushToken: order.user.expoPushToken,
      orderNumber:   order.orderNumber,
      status:        'CONFIRMED',
    }).catch(console.error)
  }

  return NextResponse.json({ received: true })
}

/** Verifica que la firma Paymentez sea reciente (tolerancia 5 min) */
function verifyPaymentezSignature(token: string, appKey: string): boolean {
  try {
    const decoded   = Buffer.from(token, 'base64').toString('utf8')
    const [, tsStr] = decoded.split(';')
    const timestamp = parseInt(tsStr, 10)
    const now       = Math.floor(Date.now() / 1000)
    return Math.abs(now - timestamp) < 300  // 5 minutos
  } catch {
    return false
  }
}
