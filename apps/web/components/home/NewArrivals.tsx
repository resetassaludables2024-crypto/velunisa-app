import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Button } from '@/components/ui/Button'

async function getNewProducts() {
  try {
    return await prisma.product.findMany({
      where:   { isActive: true, isNew: true },
      include: { category: true },
      take:    4,
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return []
  }
}

export async function NewArrivals() {
  const products = await getNewProducts()
  if (products.length === 0) return null

  return (
    <section className="py-16 laptop:py-20 bg-white">
      <div className="container-velunisa">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold tracking-[0.25em] text-brand-muted uppercase">
              Recién llegados
            </span>
            <h2 className="font-serif text-3xl laptop:text-4xl text-brand-charcoal mt-1">
              Novedades 🌸
            </h2>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/tienda?isNew=true">Ver todos</Link>
          </Button>
        </div>

        <ProductGrid products={products.map(p => ({
          ...p,
          price:        parseFloat(p.price.toString()),
          comparePrice: p.comparePrice ? parseFloat(p.comparePrice.toString()) : null,
        }))} columns={4} />
      </div>
    </section>
  )
}
