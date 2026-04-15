import { NextRequest, NextResponse } from 'next/server'
import {
  getOrCreateSession,
  getChatHistory,
  saveMessage,
  buildSystemPrompt,
} from '@/lib/claude'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'
import { z }     from 'zod'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const Schema = z.object({
  message:   z.string().min(1).max(2000),
  sessionId: z.string().min(1),
})

/**
 * POST /api/mobile/chat
 * Non-streaming chat endpoint for the React Native app.
 * Returns { reply: string } as regular JSON.
 */
export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { message, sessionId } = parsed.data

  await getOrCreateSession(sessionId)
  await saveMessage(sessionId, 'user', message)

  const history = await getChatHistory(sessionId, 20)

  // Order lookup
  const orderMatch = message.match(/\bVEL-\d{4}-\d{5}\b/i)
  let orderContext = ''
  if (orderMatch) {
    const order = await prisma.order.findUnique({
      where:   { orderNumber: orderMatch[0].toUpperCase() },
      include: { items: true },
    }).catch(() => null)

    if (order) {
      const statusLabels: Record<string, string> = {
        PENDING:    'Pendiente de pago',
        CONFIRMED:  'Confirmado',
        PROCESSING: 'En preparación',
        SHIPPED:    'Enviado',
        DELIVERED:  'Entregado',
        CANCELLED:  'Cancelado',
      }
      const paymentLabels: Record<string, string> = {
        AWAITING_TRANSFER:  'Esperando transferencia',
        TRANSFER_SUBMITTED: 'Comprobante recibido, en revisión',
        CONFIRMED:          'Pago confirmado',
        FAILED:             'Pago fallido',
        REFUNDED:           'Reembolsado',
      }
      const addr = order.shippingAddress as unknown as Record<string, string>
      const itemsSummary = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
      orderContext = `\n\n[CONTEXTO DE PEDIDO CONSULTADO]\nPedido: ${order.orderNumber}\nEstado: ${statusLabels[order.status] ?? order.status}\nPago: ${paymentLabels[order.paymentStatus] ?? order.paymentStatus}\nTotal: $${parseFloat(order.total.toString()).toFixed(2)}\nProductos: ${itemsSummary}\nCliente: ${addr.firstName ?? ''} ${addr.lastName ?? ''}\nFecha: ${new Date(order.createdAt).toLocaleDateString('es-EC')}\n[FIN CONTEXTO]`
    } else {
      orderContext = `\n\n[CONTEXTO: El pedido ${orderMatch[0]} no fue encontrado en el sistema.]`
    }
  }

  const systemPrompt = await buildSystemPrompt(orderContext)

  try {
    const response = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   history,
    })

    const reply = response.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map(b => b.text)
      .join('')

    await saveMessage(sessionId, 'assistant', reply)

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[mobile/chat] Claude error:', err)
    return NextResponse.json(
      { reply: 'Lo siento, tuve un problema al responder. Inténtalo de nuevo 🌸' },
      { status: 200 }
    )
  }
}
