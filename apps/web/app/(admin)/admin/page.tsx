import { prisma }   from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Dashboard' }

async function getStats() {
  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    totalProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: 'AWAITING_TRANSFER' } }),
    prisma.order.count({ where: { paymentStatus: 'CONFIRMED' } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      take:    10,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
  ])

  const revenue = await prisma.order.aggregate({
    where: { paymentStatus: 'CONFIRMED' },
    _sum:  { total: true },
  })

  return { totalOrders, pendingOrders, confirmedOrders, totalProducts, recentOrders, revenue }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const totalRevenue = stats.revenue._sum.total ? parseFloat(stats.revenue._sum.total.toString()) : 0

  return (
    <div>
      <h1 className="font-serif text-2xl text-brand-charcoal mb-8">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 laptop:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Pedidos totales',    value: stats.totalOrders,    color: 'bg-brand-charcoal text-white' },
          { label: 'Pendientes de pago', value: stats.pendingOrders,  color: 'bg-amber-50 text-amber-800', badge: true },
          { label: 'Pedidos confirmados',value: stats.confirmedOrders,color: 'bg-green-50 text-green-800' },
          { label: 'Ingresos confirmados',value: formatPrice(totalRevenue), color: 'bg-brand-cream text-brand-charcoal', isPrice: true },
        ].map(card => (
          <div key={card.label} className={`rounded-xl p-5 ${card.color}`}>
            <p className="text-xs opacity-70 mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
            {card.badge && stats.pendingOrders > 0 && (
              <span className="inline-block mt-2 text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-pill">
                Requieren atención
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-tan/20 flex items-center justify-between">
          <h2 className="font-serif text-lg text-brand-charcoal">Pedidos recientes</h2>
          <a href="/admin/pedidos" className="text-xs text-brand-tan hover:text-brand-charcoal transition-colors">
            Ver todos →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-bg">
              <tr>
                {['Pedido', 'Items', 'Total', 'Estado pago', 'Fecha'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-tan/10">
              {stats.recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-brand-bg/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-sm text-brand-charcoal font-medium">
                    <a href={`/admin/pedidos/${order.orderNumber}`} className="hover:text-brand-tan transition-colors">
                      {order.orderNumber}
                    </a>
                  </td>
                  <td className="px-5 py-4 text-sm text-brand-muted">
                    {order.items.reduce((s, i) => s + i.quantity, 0)}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-brand-charcoal">
                    {formatPrice(parseFloat(order.total.toString()))}
                  </td>
                  <td className="px-5 py-4">
                    <PaymentBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-5 py-4 text-xs text-brand-muted">
                    {new Date(order.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    AWAITING_TRANSFER:  { label: 'Esperando',   class: 'bg-amber-100 text-amber-800' },
    TRANSFER_SUBMITTED: { label: 'En revisión', class: 'bg-blue-100 text-blue-800' },
    CONFIRMED:          { label: 'Confirmado',  class: 'bg-green-100 text-green-800' },
    FAILED:             { label: 'Fallido',     class: 'bg-red-100 text-red-800' },
    REFUNDED:           { label: 'Reembolsado', class: 'bg-gray-100 text-gray-700' },
  }
  const c = config[status] ?? { label: status, class: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${c.class}`}>
      {c.label}
    </span>
  )
}
