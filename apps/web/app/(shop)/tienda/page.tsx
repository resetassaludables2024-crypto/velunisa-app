import { Suspense } from 'react'
import { prisma }        from '@/lib/db'
import { ProductGrid }   from '@/components/product/ProductGrid'
import { ProductFilters }       from '@/components/product/ProductFilters'
import { MobileFiltersDrawer } from '@/components/product/MobileFiltersDrawer'
import { WhatsAppCTA }   from '@/components/home/WhatsAppCTA'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Tienda',
  description: 'Explora todos nuestros wax melts artesanales para Baby Shower, Bodas, Cumpleaños y Días Especiales.',
}

type SearchParams = Record<string, string | undefined>

async function getProducts(params: SearchParams) {
  const where: any = { isActive: true }
  if (params.category)   where.category = { slug: params.category }
  if (params.isNew)      where.isNew     = true
  if (params.isFeatured) where.isFeatured = true
  if (params.q) {
    where.OR = [
      { name:        { contains: params.q } },
      { description: { contains: params.q } },
    ]
  }

  const orderBy: any =
    params.sort === 'price_asc'  ? { price: 'asc' }   :
    params.sort === 'price_desc' ? { price: 'desc' }  :
    params.sort === 'newest'     ? { createdAt: 'desc' } :
                                    { isFeatured: 'desc' }

  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy,
  })
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [products, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ])

  const title =
    searchParams.q          ? `Resultados para "${searchParams.q}"` :
    searchParams.isNew      ? 'Novedades'   :
    searchParams.isFeatured ? 'Destacados'  :
                              'Todos los productos'

  return (
    <>
      <div className="bg-brand-bg border-b border-brand-tan/20 py-8">
        <div className="container-velunisa">
          <p className="text-xs text-brand-muted uppercase tracking-widest mb-1">Tienda</p>
          <h1 className="font-serif text-3xl text-brand-charcoal">{title}</h1>
          <p className="text-sm text-brand-muted mt-1">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="container-velunisa py-10">
        {/* Mobile filter bar */}
        <div className="flex items-center justify-between mb-6 laptop:hidden">
          <p className="text-sm text-brand-muted">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
          <MobileFiltersDrawer categories={categories} current={searchParams} />
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden laptop:block w-56 flex-shrink-0">
            <ProductFilters categories={categories} current={searchParams} />
          </aside>

          {/* Products */}
          <main className="flex-1">
            <Suspense fallback={<div className="text-center py-10 text-brand-muted">Cargando...</div>}>
              <ProductGrid
                products={products.map(p => ({
                  ...p,
                  price:        parseFloat(p.price.toString()),
                  comparePrice: p.comparePrice ? parseFloat(p.comparePrice.toString()) : null,
                }))}
                columns={3}
              />
            </Suspense>
          </main>
        </div>
      </div>
      <WhatsAppCTA />
    </>
  )
}
