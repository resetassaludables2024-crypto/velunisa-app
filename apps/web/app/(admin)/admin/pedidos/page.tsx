import Link      from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'
import { ConfirmButton } from './ConfirmButton'

export const metadata: Metadata = { title: 'Admin — Pedidos' }

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true, user: true },
  })

  return (
    <div>
      <h1 className="font-serif text-2xl text-brand-charcoal mb-8">Pedidos</h1>

      <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-bg">
              <tr>
                {['Pedido', 'Cliente', 'Items', 'Total', 'Pago', 'Estado', 'Fecha', 'Acción'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-tan/10">
              {orders.map(order => {
                const email   = order.user?.email ?? order.guestEmail ?? '—'
                const address = order.shippingAddress as any
                return (
                  <tr key={order.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-brand-charcoal font-medium">
                      <Link href={`/admin/pedidos/${order.orderNumber}`} className="hover:text-brand-tan">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-muted max-w-[140px] truncate">
                      {address?.firstName ? `${address.firstName} ${address.lastName}` : email}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-muted text-center">
                      {order.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-brand-charcoal whitespace-nowrap">
                      {formatPrice(parseFloat(order.total.toString()))}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-muted whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      {order.paymentStatus === 'TRANSFER_SUBMITTED' && (
                        <ConfirmButton orderNumber={order.orderNumber} />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    AWAITING_TRANSFER:  { label: 'Esperando',    class: 'bg-amber-100 text-amber-800' },
    TRANSFER_SUBMITTED: { label: 'En revisión',  class: 'bg-blue-100 text-blue-800' },
    CONFIRMED:          { label: 'Confirmado',   class: 'bg-green-100 text-green-800' },
    FAILED:             { label: 'Fallido',      class: 'bg-red-100 text-red-800' },
    REFUNDED:           { label: 'Reembolsado',  class: 'bg-gray-100 text-gray-700' },
  }
  const c = map[status] ?? { label: status, class: 'bg-gray-100 text-gray-700' }
  return <span className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${c.class}`}>{c.label}</span>
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    PENDING:    { label: 'Pendiente',   class: 'bg-gray-100 text-gray-700' },
    CONFIRMED:  { label: 'Confirmado',  class: 'bg-blue-100 text-blue-800' },
    PROCESSING: { label: 'Procesando', class: 'bg-purple-100 text-purple-800' },
    SHIPPED:    { label: 'Enviado',     class: 'bg-indigo-100 text-indigo-800' },
    DELIVERED:  { label: 'Entregado',  class: 'bg-green-100 text-green-800' },
    CANCELLED:  { label: 'Cancelado',  class: 'bg-red-100 text-red-800' },
  }
  const c = map[status] ?? { label: status, class: 'bg-gray-100 text-gray-700' }
  return <span className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${c.class}`}>{c.label}</span>
}

