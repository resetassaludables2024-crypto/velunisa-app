import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/db'
import { sendTextMessage }           from '@/lib/whatsapp'
import crypto                        from 'crypto'

// Verify webhook (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// Handle incoming messages (POST)
export async function POST(req: NextRequest) {
  // Validate HMAC signature
  const signature = req.headers.get('x-hub-signature-256') ?? ''
  const body      = await req.text()

  if (process.env.WHATSAPP_APP_SECRET) {
    const expected = 'sha256=' + crypto
      .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
      .update(body)
      .digest('hex')
    if (signature !== expected) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }
  }

  const payload = JSON.parse(body)

  // Log webhook event
  await prisma.webhookEvent.create({
    data: {
      source:    'whatsapp',
      eventType: 'message',
      payload,
    },
  })

  // Process messages
  try {
    const entry   = payload.entry?.[0]
    const changes = entry?.changes?.[0]
    const value   = changes?.value
    const messages = value?.messages ?? []

    for (const msg of messages) {
      const from = msg.from as string
      const text = (msg.text?.body as string) ?? ''

      // Check if message contains an order number
      const orderMatch = text.match(/VEL-\d{4}-\d+/i)
      if (orderMatch) {
        const order = await prisma.order.findUnique({
          where:   { orderNumber: orderMatch[0].toUpperCase() },
          include: { items: true },
        })
        if (order) {
          await sendTextMessage(
            from,
            `📦 *Pedido ${order.orderNumber}*\n` +
            `Estado: ${translateStatus(order.status)}\n` +
            `Pago: ${translatePaymentStatus(order.paymentStatus)}\n` +
            `Total: $${parseFloat(order.total.toString()).toFixed(2)}`
          )
          continue
        }
      }

      // Default response
      await sendTextMessage(
        from,
        `¡Hola! 🌸 Soy Luna de *Velunisa*.\n\n` +
        `Para consultar tu pedido, escríbeme tu número (ej: VEL-2026-12345).\n\n` +
        `Para más ayuda visita: ${process.env.NEXT_PUBLIC_APP_URL}`
      )
    }
  } catch (err) {
    console.error('WhatsApp webhook processing error:', err)
  }

  return NextResponse.json({ success: true })
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING:    '⏳ Pendiente',
    CONFIRMED:  '✅ Confirmado',
    PROCESSING: '🔧 En proceso',
    SHIPPED:    '🚚 Enviado',
    DELIVERED:  '📦 Entregado',
    CANCELLED:  '❌ Cancelado',
  }
  return map[status] ?? status
}

function translatePaymentStatus(status: string): string {
  const map: Record<string, string> = {
    AWAITING_TRANSFER:   '⏳ Esperando transferencia',
    TRANSFER_SUBMITTED:  '📤 Comprobante recibido',
    CONFIRMED:           '✅ Pago confirmado',
    FAILED:              '❌ Pago fallido',
    REFUNDED:            '🔄 Reembolsado',
  }
  return map[status] ?? status
}
