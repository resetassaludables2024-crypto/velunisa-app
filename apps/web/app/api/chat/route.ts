import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import {
  getOrCreateSession,
  getChatHistory,
  saveMessage,
  buildSystemPrompt,
  streamChatResponse,
} from '@/lib/claude'
import { prisma } from '@/lib/db'
import { z }      from 'zod'

const Schema = z.object({
  message:   z.string().min(1).max(2000),
  sessionId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id as string | undefined

  const body   = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { message, sessionId } = parsed.data

  // Get/create chat session
  await getOrCreateSession(sessionId, userId)

  // Save user message
  await saveMessage(sessionId, 'user', message)

  // Get history
  const history = await getChatHistory(sessionId, 20)

  // Order lookup: if message contains a VEL order number, fetch and inject into prompt
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
      orderContext = `\n\n[CONTEXTO: El pedido ${orderMatch[0]} no fue encontrado en el sistema. Informa amablemente que el número no existe o pide que lo verifique.]`
    }
  }

  // Build system prompt with catalog (+ order context if applicable)
  const systemPrompt = await buildSystemPrompt(orderContext)

  // Create streaming response
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = ''
      try {
        const claudeStream = await streamChatResponse(history, systemPrompt)

        for await (const chunk of claudeStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const text = chunk.delta.text
            fullResponse += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }

        // Save assistant response
        await saveMessage(sessionId, 'assistant', fullResponse)
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Error processing message' })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection:      'keep-alive',
    },
  })
}
