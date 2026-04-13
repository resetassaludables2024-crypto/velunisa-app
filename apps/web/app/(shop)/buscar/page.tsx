import { prisma }       from '@/lib/db'
import { ProductGrid }  from '@/components/product/ProductGrid'
import { WhatsAppCTA }  from '@/components/home/WhatsAppCTA'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Búsqueda' }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = searchParams.q ?? ''

  const products = q.length > 0
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name:        { contains: q } },
            { description: { contains: q } },
          ],
        },
        include: { category: true },
        orderBy: { isFeatured: 'desc' },
      })
    : []

  return (
    <>
      <div className="bg-brand-bg border-b border-brand-tan/20 py-8">
        <div className="container-velunisa">
          <h1 className="font-serif text-3xl text-brand-charcoal">
            {q ? `Resultados para "${q}"` : 'Buscar'}
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            {q ? `${products.length} resultado${products.length !== 1 ? 's' : ''}` : 'Escribe algo para buscar'}
          </p>
        </div>
      </div>

      <div className="container-velunisa py-10">
        {q && (
          <ProductGrid
            products={products.map(p => ({
              ...p,
              price:        parseFloat(p.price.toString()),
              comparePrice: p.comparePrice ? parseFloat(p.comparePrice.toString()) : null,
            }))}
          />
        )}
      </div>
      <WhatsAppCTA />
    </>
  )
}
