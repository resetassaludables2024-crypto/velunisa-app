import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { prisma }            from '@/lib/db'
import Link                  from 'next/link'
import { formatPrice }       from '@/lib/utils'
import type { Metadata }     from 'next'
import { EditProfileClient } from './EditProfileClient'

export const metadata: Metadata = { title: 'Mi cuenta' }

export default async function MiCuentaPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id

  const [user, recentOrders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, phone: true, password: true } }),
    prisma.order.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      take:    5,
      include: { items: true },
    }),
  ])

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-brand-charcoal">Hola, {user?.name?.split(' ')[0]} 🌸</h1>
        <p className="text-brand-muted text-sm mt-1">{user?.email}</p>
        {user?.phone && <p className="text-brand-muted text-sm">{user.phone}</p>}
      </div>

      {/* Account settings */}
      <div>
        <h2 className="font-serif text-lg text-brand-charcoal mb-3">Configuración de cuenta</h2>
        <EditProfileClient
          initialName={user?.name ?? ''}
          initialPhone={user?.phone ?? ''}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-tan/20 flex items-center justify-between">
          <h2 className="font-serif text-lg text-brand-charcoal">Pedidos recientes</h2>
          <Link href="/mis-pedidos" className="text-xs text-brand-tan hover:text-brand-charcoal transition-colors">
            Ver todos →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-brand-muted text-sm">
            No tienes pedidos aún.{' '}
            <Link href="/tienda" className="text-brand-charcoal underline">¡Explora la tienda!</Link>
          </div>
        ) : (
          <ul className="divide-y divide-brand-tan/10">
            {recentOrders.map(order => (
              <li key={order.id}>
                <Link
                  href={`/mis-pedidos/${order.orderNumber}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-brand-bg transition-colors"
                >
                  <div>
                    <p className="font-mono text-sm font-medium text-brand-charcoal">{order.orderNumber}</p>
                    <p className="text-xs text-brand-muted mt-0.5">
                      {order.items.length} producto{order.items.length !== 1 ? 's' : ''} ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-charcoal">{formatPrice(parseFloat(order.total.toString()))}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-pill ${
                      order.paymentStatus === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.paymentStatus === 'CONFIRMED' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
