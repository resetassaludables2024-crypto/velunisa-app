const WA_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`
const WA_TOKEN   = process.env.WHATSAPP_ACCESS_TOKEN ?? ''

async function sendRequest(body: object) {
  const res = await fetch(WA_API_URL, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`WhatsApp API error: ${err}`)
  }
  return res.json()
}

export async function sendOrderConfirmation(phone: string, order: {
  orderNumber: string
  total: number
  items: Array<{ name: string; quantity: number }>
}): Promise<void> {
  await sendRequest({
    messaging_product: 'whatsapp',
    to:                phone,
    type:              'text',
    text: {
      body: `🌸 *¡Gracias por tu pedido en Velunisa!*\n\n` +
            `Tu pedido *${order.orderNumber}* fue recibido.\n\n` +
            `*Resumen:*\n` +
            order.items.map(i => `• ${i.quantity}x ${i.name}`).join('\n') +
            `\n\n*Total: $${order.total.toFixed(2)}*\n\n` +
            `Por favor realiza la transferencia bancaria y envía tu comprobante por este chat o cárgalo en la web.\n\n` +
            `Una vez confirmado el pago, procesaremos tu pedido de inmediato. 💛`,
    },
  })
}

export async function sendPaymentConfirmed(phone: string, orderNumber: string): Promise<void> {
  await sendRequest({
    messaging_product: 'whatsapp',
    to:                phone,
    type:              'text',
    text: {
      body: `✅ *¡Pago confirmado! - Velunisa*\n\n` +
            `Hemos verificado tu transferencia para el pedido *${orderNumber}*.\n\n` +
            `Tu pedido está siendo preparado con mucho cariño. 🕯️\n\n` +
            `Te notificaremos cuando salga para entrega. ¡Gracias por confiar en nosotros!`,
    },
  })
}

export async function sendShippingUpdate(phone: string, orderNumber: string, trackingInfo?: string): Promise<void> {
  await sendRequest({
    messaging_product: 'whatsapp',
    to:                phone,
    type:              'text',
    text: {
      body: `🚚 *¡Tu pedido está en camino! - Velunisa*\n\n` +
            `El pedido *${orderNumber}* fue enviado.\n\n` +
            (trackingInfo ? `Seguimiento: ${trackingInfo}\n\n` : '') +
            `Pronto recibirás tus wax melts. ¡Esperamos que los disfrutes! 🌸`,
    },
  })
}

export async function sendTextMessage(phone: string, text: string): Promise<void> {
  await sendRequest({
    messaging_product: 'whatsapp',
    to:                phone,
    type:              'text',
    text:              { body: text },
  })
}
