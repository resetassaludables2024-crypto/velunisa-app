import { notFound }          from 'next/navigation'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { prisma }            from '@/lib/db'
import Link                  from 'next/link'
import { formatPrice }       from '@/lib/utils'
import { ChevronLeft }       from 'lucide-react'
import type { Metadata }     from 'next'

interface PageProps { params: { orderNumber: string } }

export const metadata: Metadata = { title: 'Detalle de pedido' }

const STATUS_STEPS = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED']
const STATUS_LABEL: Record<string, string> = {
  PENDING:    'Pendiente de pago',
  CONFIRMED:  'Pago confirmado',
  PROCESSING: 'Preparando pedido',
  SHIPPED:    'En camino',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
}
const PAYMENT_LABEL: Record<string, string> = {
  AWAITING_TRANSFER:  'Esperando transferencia',
  TRANSFER_SUBMITTED: 'Comprobante enviado',
  CONFIRMED:          'Pago confirmado',
  FAILED:             'Pago fallido',
  REFUNDED:           'Reembolsado',
}

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id

  const order = await prisma.order.findFirst({
    where:   { orderNumber: params.orderNumber, userId },
    include: { items: true },
  })
  if (!order) notFound()

  const address = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress

  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back */}
      <Link href="/mis-pedidos" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-charcoal transition-colors">
        <ChevronLeft size={16} />
        Mis pedidos
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-brand-tan/20 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-brand-muted uppercase tracking-widest mb-1">Pedido</p>
            <h1 className="font-mono text-2xl font-bold text-brand-charcoal">{order.orderNumber}</h1>
            <p className="text-xs text-brand-muted mt-1">
              {new Date(order.createdAt).toLocaleDateString('es-EC', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-charcoal">
              {formatPrice(parseFloat(order.total.toString()))}
            </p>
            <p className="text-xs text-brand-muted mt-1">
              Pago: <span className="font-medium">{PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {order.status !== 'CANCELLED' && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i <= currentStep ? 'bg-brand-charcoal text-white' : 'bg-brand-tan/30 text-brand-muted'
                  }`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <p className={`text-[10px] text-center leading-tight hidden tablet:block ${
                    i <= currentStep ? 'text-brand-charcoal font-medium' : 'text-brand-muted'
                  }`}>
                    {STATUS_LABEL[step]}
                  </p>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`hidden tablet:block absolute h-0.5 w-full top-3.5 left-1/2 ${
                      i < currentStep ? 'bg-brand-charcoal' : 'bg-brand-tan/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-brand-charcoal text-center mt-2 tablet:hidden">
              {STATUS_LABEL[order.status]}
            </p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-tan/20">
          <h2 className="font-serif text-lg text-brand-charcoal">Productos</h2>
        </div>
        <ul className="divide-y divide-brand-tan/10">
          {order.items.map(item => (
            <li key={item.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-12 h-12 rounded-lg bg-brand-bg flex items-center justify-center flex-shrink-0 text-xl">
                🕯️
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-charcoal truncate">{item.name}</p>
                <p className="text-xs text-brand-muted">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-brand-charcoal flex-shrink-0">
                {formatPrice(parseFloat(item.price.toString()) * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="px-6 py-4 border-t border-brand-tan/20 space-y-2">
          <div className="flex justify-between text-sm text-brand-muted">
            <span>Subtotal</span>
            <span>{formatPrice(parseFloat(order.subtotal.toString()))}</span>
          </div>
          <div className="flex justify-between text-sm text-brand-muted">
            <span>Envío</span>
            <span>{parseFloat(order.shippingCost.toString()) === 0 ? 'Gratis' : formatPrice(parseFloat(order.shippingCost.toString()))}</span>
          </div>
          <div className="flex justify-between font-bold text-brand-charcoal pt-2 border-t border-brand-tan/20">
            <span>Total</span>
            <span>{formatPrice(parseFloat(order.total.toString()))}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {address && (
        <div className="bg-white rounded-xl border border-brand-tan/20 p-6">
          <h2 className="font-serif text-lg text-brand-charcoal mb-4">Dirección de envío</h2>
          <p className="text-sm text-brand-charcoal font-medium">{address.firstName} {address.lastName}</p>
          <p className="text-sm text-brand-muted">{address.address}</p>
          <p className="text-sm text-brand-muted">{address.city}, {address.province}</p>
          <p className="text-sm text-brand-muted">{address.phone}</p>
        </div>
      )}

      {/* Help */}
      <div className="text-center text-sm text-brand-muted">
        ¿Tienes dudas sobre tu pedido?{' '}
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Consulta sobre pedido ${order.orderNumber}`)}`}
          className="text-brand-charcoal underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Escríbenos por WhatsApp
        </a>
      </div>
    </div>
  )
}
