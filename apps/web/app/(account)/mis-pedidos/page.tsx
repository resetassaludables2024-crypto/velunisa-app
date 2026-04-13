import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'
import Link                 from 'next/link'
import { formatPrice }      from '@/lib/utils'
import { Package }          from 'lucide-react'
import type { Metadata }    from 'next'

export const metadata: Metadata = { title: 'Mis pedidos' }

const STATUS_LABEL: Record<string, string> = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmado',
  PROCESSING: 'Preparando',
  SHIPPED:    'Enviado',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-800',
  CONFIRMED:  'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED:    'bg-indigo-100 text-indigo-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
}

export default async function MisPedidosPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id

  const orders = await prisma.order.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-brand-charcoal">Mis pedidos</h1>
        <p className="text-brand-muted text-sm mt-1">{orders.length} pedido{orders.length !== 1 ? 's' : ''} en total</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-tan/20 py-16 text-center">
          <Package size={48} className="mx-auto text-brand-tan mb-4" />
          <p className="font-serif text-xl text-brand-charcoal mb-2">Aún no tienes pedidos</p>
          <p className="text-brand-muted text-sm mb-6">¡Explora nuestra tienda y encuentra el regalo perfecto!</p>
          <Link href="/tienda" className="btn-dark">Ver tienda</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden divide-y divide-brand-tan/10">
          {orders.map(order => (
            <Link
              key={order.id}
              href={`/mis-pedidos/${order.orderNumber}`}
              className="flex items-center justify-between px-6 py-5 hover:bg-brand-bg transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-brand-charcoal" />
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold text-brand-charcoal group-hover:text-brand-tan transition-colors">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-brand-muted mt-0.5">
                    {order.items.length} producto{order.items.length !== 1 ? 's' : ''} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString('es-EC', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="font-semibold text-brand-charcoal">
                  {formatPrice(parseFloat(order.total.toString()))}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-pill mt-1 inline-block ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
