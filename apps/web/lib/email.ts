import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = `${process.env.RESEND_FROM_NAME ?? 'Velunisa'} <${process.env.RESEND_FROM_EMAIL ?? 'noreply@velunisa.com'}>`

export async function sendOrderConfirmationEmail(params: {
  to:          string
  orderNumber: string
  items:       Array<{ name: string; quantity: number; price: number }>
  total:       number
  shippingAddress: {
    firstName: string
    lastName:  string
    address:   string
    city:      string
    province:  string
  }
  bankDetails: {
    bankName:      string
    accountNumber: string
    accountOwner:  string
    accountType:   string
  }
}): Promise<void> {
  const itemsHtml = params.items
    .map(i => `<tr>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center;">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`)
    .join('')

  await resend.emails.send({
    from:    FROM,
    to:      params.to,
    subject: `Pedido ${params.orderNumber} recibido - Velunisa 🌸`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Confirmación de Pedido - Velunisa</title></head>
<body style="font-family:'Open Sans',Arial,sans-serif;background:#FBFBFB;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;background:#fff;">
    <!-- Header -->
    <div style="background:#4F5353;padding:32px;text-align:center;">
      <h1 style="font-family:Georgia,serif;color:#ECDBCE;margin:0;font-size:28px;letter-spacing:2px;">VELUNISA</h1>
      <p style="color:#DBBBA4;margin:8px 0 0;font-size:13px;letter-spacing:1px;">WAX MELTS ARTESANALES</p>
    </div>
    <!-- Content -->
    <div style="padding:32px;">
      <h2 style="font-family:Georgia,serif;color:#4F5353;margin-top:0;">¡Gracias por tu pedido! 🌸</h2>
      <p style="color:#0C1B2C;line-height:1.6;">Hola <strong>${params.shippingAddress.firstName}</strong>, recibimos tu pedido exitosamente.</p>

      <div style="background:#FBFBFB;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#888;">Número de pedido</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#4F5353;">${params.orderNumber}</p>
      </div>

      <!-- Items -->
      <table width="100%" style="border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background:#ECDBCE;">
            <th style="padding:10px;text-align:left;font-size:12px;color:#4F5353;">PRODUCTO</th>
            <th style="padding:10px;text-align:center;font-size:12px;color:#4F5353;">CANT.</th>
            <th style="padding:10px;text-align:right;font-size:12px;color:#4F5353;">TOTAL</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 8px;font-weight:700;color:#4F5353;">TOTAL A PAGAR</td>
            <td style="padding:12px 8px;font-weight:700;color:#4F5353;text-align:right;font-size:18px;">$${params.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Payment Instructions -->
      <div style="border:2px solid #ECDBCE;border-radius:8px;padding:20px;margin:20px 0;">
        <h3 style="font-family:Georgia,serif;color:#4F5353;margin-top:0;">Instrucciones de Pago</h3>
        <p style="color:#0C1B2C;line-height:1.6;font-size:14px;">Realiza una transferencia bancaria con los siguientes datos:</p>
        <table style="font-size:14px;color:#0C1B2C;line-height:1.8;">
          <tr><td style="font-weight:600;padding-right:16px;">Banco:</td><td>${params.bankDetails.bankName}</td></tr>
          <tr><td style="font-weight:600;padding-right:16px;">Tipo:</td><td>${params.bankDetails.accountType}</td></tr>
          <tr><td style="font-weight:600;padding-right:16px;">Número:</td><td>${params.bankDetails.accountNumber}</td></tr>
          <tr><td style="font-weight:600;padding-right:16px;">Titular:</td><td>${params.bankDetails.accountOwner}</td></tr>
          <tr><td style="font-weight:600;padding-right:16px;">Monto:</td><td><strong>$${params.total.toFixed(2)}</strong></td></tr>
        </table>
        <p style="color:#888;font-size:13px;margin-top:16px;">Una vez realizada la transferencia, sube tu comprobante en <a href="${process.env.NEXT_PUBLIC_APP_URL}/checkout/pago?order=${params.orderNumber}" style="color:#4F5353;">velunisa.com</a> o envíalo por WhatsApp al ${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}.</p>
      </div>

      <p style="color:#888;font-size:13px;text-align:center;">¿Tienes preguntas? Escríbenos por WhatsApp al ${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}</p>
    </div>
    <!-- Footer -->
    <div style="background:#4F5353;padding:20px;text-align:center;">
      <p style="color:#DBBBA4;font-size:12px;margin:0;">© ${new Date().getFullYear()} Velunisa — Wax Melts Artesanales Ecuador</p>
    </div>
  </div>
</body>
</html>`,
  })
}

export async function sendPaymentConfirmedEmail(params: {
  to:          string
  orderNumber: string
  firstName:   string
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://velunisa.com'
  await resend.emails.send({
    from:    FROM,
    to:      params.to,
    subject: `¡Pago confirmado! Pedido ${params.orderNumber} - Velunisa ✅`,
    html: `
<div style="font-family:'Open Sans',Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#4F5353;padding:32px;text-align:center;">
    <h1 style="font-family:Georgia,serif;color:#ECDBCE;margin:0;font-size:28px;letter-spacing:2px;">VELUNISA</h1>
    <p style="color:#DBBBA4;margin:8px 0 0;font-size:13px;letter-spacing:1px;">WAX MELTS ARTESANALES</p>
  </div>
  <div style="padding:32px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#d1fae5;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;text-align:center;">✅</div>
    </div>
    <h2 style="font-family:Georgia,serif;color:#4F5353;text-align:center;margin-top:0;">¡Pago confirmado!</h2>
    <p style="color:#0C1B2C;line-height:1.6;">Hola <strong>${params.firstName}</strong>, confirmamos la recepción de tu transferencia para el pedido <strong>${params.orderNumber}</strong>.</p>
    <p style="color:#0C1B2C;line-height:1.6;">Tu pedido está siendo preparado con mucho cariño en nuestro taller. 🕯️ Te notificaremos cuando salga para entrega.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${appUrl}/mis-pedidos/${params.orderNumber}"
         style="background:#4F5353;color:#ECDBCE;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
        Ver estado del pedido →
      </a>
    </div>
    <p style="color:#888;font-size:13px;text-align:center;">¿Tienes dudas? Escríbenos por WhatsApp al ${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}</p>
  </div>
  <div style="background:#4F5353;padding:20px;text-align:center;">
    <p style="color:#DBBBA4;font-size:12px;margin:0;">© ${new Date().getFullYear()} Velunisa — Wax Melts Artesanales Ecuador</p>
  </div>
</div>`,
  })
}

export async function sendOrderShippedEmail(params: {
  to:           string
  orderNumber:  string
  firstName:    string
  trackingCode?: string
  carrier?:     string
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://velunisa.com'
  await resend.emails.send({
    from:    FROM,
    to:      params.to,
    subject: `¡Tu pedido ${params.orderNumber} está en camino! 🚚 - Velunisa`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Pedido Enviado - Velunisa</title></head>
<body style="font-family:'Open Sans',Arial,sans-serif;background:#FBFBFB;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;background:#fff;">
    <!-- Header -->
    <div style="background:#4F5353;padding:32px;text-align:center;">
      <h1 style="font-family:Georgia,serif;color:#ECDBCE;margin:0;font-size:28px;letter-spacing:2px;">VELUNISA</h1>
      <p style="color:#DBBBA4;margin:8px 0 0;font-size:13px;letter-spacing:1px;">WAX MELTS ARTESANALES</p>
    </div>
    <!-- Content -->
    <div style="padding:32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;">🚚</div>
      </div>
      <h2 style="font-family:Georgia,serif;color:#4F5353;text-align:center;margin-top:0;">¡Tu pedido está en camino!</h2>
      <p style="color:#0C1B2C;line-height:1.6;">Hola <strong>${params.firstName}</strong>, tu pedido <strong>${params.orderNumber}</strong> fue despachado y está en camino hacia ti.</p>

      ${params.trackingCode ? `
      <div style="background:#FBFBFB;border:2px solid #ECDBCE;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#888;">Número de seguimiento</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#4F5353;letter-spacing:2px;">${params.trackingCode}</p>
        ${params.carrier ? `<p style="margin:8px 0 0;font-size:13px;color:#888;">Servicio: ${params.carrier}</p>` : ''}
      </div>` : `
      <div style="background:#FBFBFB;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0;color:#0C1B2C;font-size:14px;line-height:1.6;">⏱️ Tiempo estimado de entrega: <strong>2-5 días hábiles</strong> según tu provincia.</p>
      </div>`}

      <p style="color:#0C1B2C;line-height:1.6;">Pronto recibirás tus wax melts artesanales. ¡Esperamos que los disfrutes tanto como nosotros los preparamos! 🌸</p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${appUrl}/mis-pedidos/${params.orderNumber}"
           style="background:#4F5353;color:#ECDBCE;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
          Ver detalles del pedido →
        </a>
      </div>
      <p style="color:#888;font-size:13px;text-align:center;">¿Alguna duda? Escríbenos por WhatsApp al ${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}</p>
    </div>
    <!-- Footer -->
    <div style="background:#4F5353;padding:20px;text-align:center;">
      <p style="color:#DBBBA4;font-size:12px;margin:0;">© ${new Date().getFullYear()} Velunisa — Wax Melts Artesanales Ecuador</p>
    </div>
  </div>
</body>
</html>`,
  })
}
