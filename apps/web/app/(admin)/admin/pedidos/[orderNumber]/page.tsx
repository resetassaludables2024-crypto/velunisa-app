import { notFound }    from 'next/navigation'
import Link            from 'next/link'
import { prisma }      from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'
import { ConfirmButton } from '../ConfirmButton'
import { OrderStatusSelect } from './OrderStatusSelect'

interface PageProps { params: { orderNumber: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: `Pedido ${params.orderNumber}` }
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const order = await prisma.order.findUnique({
    where:   { orderNumber: params.orderNumber },
    include: { items: true, user: true },
  })
  if (!order) notFound()

  const address = order.shippingAddress as unknown as Record<string, string>
  const email   = order.user?.email ?? order.guestEmail ?? '—'

  const statusSteps = [
    { key: 'PENDING',    label: 'Pendiente' },
    { key: 'CONFIRMED',  label: 'Confirmado' },
    { key: 'PROCESSING', label: 'Preparando' },
    { key: 'SHIPPED',    label: 'Enviado' },
    { key: 'DELIVERED',  label: 'Entregado' },
  ]
  const currentStepIdx = statusSteps.findIndex(s => s.key === order.status)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/pedidos" className="text-sm text-brand-muted hover:text-brand-charcoal transition-colors">
          ← Pedidos
        </Link>
        <h1 className="font-serif text-2xl text-brand-charcoal">
          Pedido <span className="font-mono text-brand-tan">{order.orderNumber}</span>
        </h1>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-brand-tan/20 p-6 mb-6">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i <= currentStepIdx
                    ? 'bg-brand-charcoal text-white'
                    : 'bg-brand-tan/20 text-brand-muted'
                }`}>
                  {i < currentStepIdx ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${
                  i === currentStepIdx ? 'font-semibold text-brand-charcoal' : 'text-brand-muted'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-5 ${i < currentStepIdx ? 'bg-brand-charcoal' : 'bg-brand-tan/30'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid laptop:grid-cols-3 gap-6">
        {/* Items */}
        <div className="laptop:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-tan/10">
              <h2 className="font-serif text-lg text-brand-charcoal">Productos</h2>
            </div>
            <table className="w-full">
              <thead className="bg-brand-bg">
                <tr>
                  {['Producto', 'Cantidad', 'Precio', 'Subtotal'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-brand-muted uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-tan/10">
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-brand-charcoal">{item.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-muted text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-brand-muted">{formatPrice(parseFloat(item.price.toString()))}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-brand-charcoal">
                      {formatPrice(parseFloat(item.price.toString()) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-brand-tan/20">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-brand-charcoal text-right">Total</td>
                  <td className="px-4 py-3 text-base font-bold text-brand-charcoal">
                    {formatPrice(parseFloat(order.total.toString()))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Transfer proof */}
          {(order.transferProof || order.bankTransferRef) && (
            <div className="bg-white rounded-xl border border-brand-tan/20 p-6">
              <h2 className="font-serif text-lg text-brand-charcoal mb-4">Comprobante de pago</h2>
              {order.bankTransferRef && (
                <p className="text-sm text-brand-muted mb-3">
                  Ref: <span className="font-mono text-brand-charcoal">{order.bankTransferRef}</span>
                </p>
              )}
              {order.transferProof && (
                <a href={order.transferProof} target="_blank" rel="noopener noreferrer">
                  <img
                    src={order.transferProof}
                    alt="Comprobante"
                    className="max-w-xs rounded-lg border border-brand-tan/20 hover:opacity-90 transition-opacity"
                  />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-brand-tan/20 p-5">
            <h2 className="font-serif text-base text-brand-charcoal mb-4">Acciones</h2>
            <div className="space-y-3">
              {order.paymentStatus === 'TRANSFER_SUBMITTED' && (
                <ConfirmButton orderNumber={order.orderNumber} />
              )}
              <OrderStatusSelect orderNumber={order.orderNumber} currentStatus={order.status} />
            </div>
            <div className="mt-4 pt-4 border-t border-brand-tan/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-brand-muted">Pago</span>
                <PaymentBadge status={order.paymentStatus} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-muted">Estado</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-muted">Fecha</span>
                <span className="text-brand-charcoal">
                  {new Date(order.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl border border-brand-tan/20 p-5">
            <h2 className="font-serif text-base text-brand-charcoal mb-3">Cliente</h2>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-brand-charcoal">
                {address.firstName} {address.lastName}
              </p>
              <p className="text-brand-muted">{email}</p>
              <p className="text-brand-muted">{address.phone}</p>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-xl border border-brand-tan/20 p-5">
            <h2 className="font-serif text-base text-brand-charcoal mb-3">Dirección de envío</h2>
            <div className="text-sm text-brand-muted space-y-0.5">
              <p>{address.address}</p>
              <p>{address.city}, {address.province}</p>
              {address.postalCode && <p>{address.postalCode}</p>}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">Notas del cliente</p>
              <p className="text-sm text-amber-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    AWAITING_TRANSFER:  { label: 'Esperando',   class: 'bg-amber-100 text-amber-800' },
    TRANSFER_SUBMITTED: { label: 'En revisión', class: 'bg-blue-100 text-blue-800' },
    CONFIRMED:          { label: 'Confirmado',  class: 'bg-green-100 text-green-800' },
    FAILED:             { label: 'Fallido',     class: 'bg-red-100 text-red-800' },
    REFUNDED:           { label: 'Reembolsado', class: 'bg-gray-100 text-gray-700' },
  }
  const c = map[status] ?? { label: status, class: 'bg-gray-100 text-gray-700' }
  return <span className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${c.class}`}>{c.label}</span>
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    PENDING:    { label: 'Pendiente',  class: 'bg-gray-100 text-gray-700' },
    CONFIRMED:  { label: 'Confirmado', class: 'bg-blue-100 text-blue-800' },
    PROCESSING: { label: 'Preparando',class: 'bg-purple-100 text-purple-800' },
    SHIPPED:    { label: 'Enviado',    class: 'bg-indigo-100 text-indigo-800' },
    DELIVERED:  { label: 'Entregado', class: 'bg-green-100 text-green-800' },
    CANCELLED:  { label: 'Cancelado', class: 'bg-red-100 text-red-800' },
  }
  const c = map[status] ?? { label: status, class: 'bg-gray-100 text-gray-700' }
  return <span className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${c.class}`}>{c.label}</span>
}
