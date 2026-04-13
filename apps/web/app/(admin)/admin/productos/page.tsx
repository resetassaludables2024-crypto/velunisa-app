import Link            from 'next/link'
import { prisma }      from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'
import { ProductActions } from './ProductActions'

export const metadata: Metadata = { title: 'Admin — Productos' }

export default async function AdminProductosPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl text-brand-charcoal">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-charcoal text-white text-sm font-semibold rounded-pill hover:bg-brand-dark transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-bg">
              <tr>
                {['Imagen', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-tan/10">
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-brand-muted text-sm">
                    No hay productos aún.{' '}
                    <Link href="/admin/productos/nuevo" className="text-brand-charcoal underline">
                      Crea el primero
                    </Link>
                  </td>
                </tr>
              )}
              {products.map(p => {
                const images = (p.images as unknown) as string[]
                return (
                  <tr key={p.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-brand-tan/20 rounded-lg flex items-center justify-center text-brand-muted text-xs">
                          —
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-brand-charcoal">{p.name}</p>
                      <p className="text-xs text-brand-muted font-mono">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-muted">{p.category.name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-brand-charcoal whitespace-nowrap">
                      {formatPrice(parseFloat(p.price.toString()))}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={p.stock === 0 ? 'text-red-500 font-semibold' : 'text-brand-charcoal'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${
                        p.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ProductActions id={p.id} isActive={p.isActive} />
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
