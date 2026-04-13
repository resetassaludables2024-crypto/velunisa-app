/**
 * Expo Push Notification sender (server-side)
 * Uses Expo's Push API — no SDK needed on server.
 * Docs: https://docs.expo.dev/push-notifications/sending-notifications/
 */

interface PushMessage {
  to:    string       // Expo push token
  title: string
  body:  string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
}

interface PushResult {
  status:  'ok' | 'error'
  message?: string
  details?: unknown
}

export async function sendExpoPush(messages: PushMessage[]): Promise<PushResult[]> {
  if (messages.length === 0) return []

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method:  'POST',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
        // Optional: add Expo access token for higher rate limits
        // 'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(messages.length === 1 ? messages[0] : messages),
    })

    if (!res.ok) {
      console.error('[push] Expo API error:', res.status, await res.text())
      return messages.map(() => ({ status: 'error' as const, message: 'Expo API error' }))
    }

    const json = await res.json()
    const data = Array.isArray(json.data) ? json.data : [json.data]
    return data.map((r: any) => ({
      status:  r.status === 'ok' ? 'ok' : 'error',
      message: r.message,
      details: r.details,
    }))
  } catch (err) {
    console.error('[push] sendExpoPush error:', err)
    return messages.map(() => ({ status: 'error' as const, message: String(err) }))
  }
}

/**
 * Send order status push to a user's device.
 */
export async function sendOrderStatusPush(params: {
  expoPushToken: string
  orderNumber:   string
  status:        string
  trackingCode?: string
  carrier?:      string
}) {
  const statusMessages: Record<string, { title: string; body: string }> = {
    CONFIRMED:  {
      title: '✅ Pago confirmado',
      body:  `Tu pedido ${params.orderNumber} fue confirmado. ¡Lo estamos preparando!`,
    },
    PROCESSING: {
      title: '📦 Preparando tu pedido',
      body:  `Tu pedido ${params.orderNumber} está siendo empacado con mucho cariño 🌸`,
    },
    SHIPPED: {
      title: '🚚 Tu pedido está en camino',
      body:  params.trackingCode
        ? `Pedido ${params.orderNumber} · ${params.carrier ?? 'Courrier'} · Código: ${params.trackingCode}`
        : `Tu pedido ${params.orderNumber} está en camino. ¡Pronto llegará!`,
    },
    DELIVERED: {
      title: '🎉 ¡Pedido entregado!',
      body:  `Tu pedido ${params.orderNumber} fue entregado. ¡Esperamos que lo ames! 🕯️`,
    },
    CANCELLED: {
      title: '❌ Pedido cancelado',
      body:  `Tu pedido ${params.orderNumber} fue cancelado. Contáctanos si tienes dudas.`,
    },
  }

  const msg = statusMessages[params.status]
  if (!msg) return

  return sendExpoPush([{
    to:    params.expoPushToken,
    title: msg.title,
    body:  msg.body,
    sound: 'default',
    data:  { orderNumber: params.orderNumber, status: params.status },
  }])
}
