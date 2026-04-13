import { notFound }              from 'next/navigation'
import { prisma }                from '@/lib/db'
import { ProductGrid }           from '@/components/product/ProductGrid'
import { WhatsAppCTA }           from '@/components/home/WhatsAppCTA'
import { CategoryMoodSlider }    from '@/components/category/CategoryMoodSlider'
import type { Metadata }         from 'next'

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } })
  if (!category) return { title: 'Categoría no encontrada' }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://velunisa.com'
  const desc   = category.description ?? `Wax melts artesanales para ${category.name}. Diseños únicos con fragancias irresistibles. Envíos a todo Ecuador.`
  return {
    title:       `${category.name} — Wax Melts Artesanales | Velunisa`,
    description: desc,
    keywords:    ['wax melts', category.name, 'cera aromatica', 'Ecuador', 'Velunisa', 'regalo'],
    openGraph: {
      type:        'website',
      title:       `${category.name} | Velunisa`,
      description: desc,
      url:         `${appUrl}/categoria/${category.slug}`,
      siteName:    'Velunisa',
      locale:      'es_EC',
      ...(category.image ? {
        images: [{ url: category.image, width: 1200, height: 630, alt: category.name }],
      } : {}),
    },
    alternates: {
      canonical: `${appUrl}/categoria/${category.slug}`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } })
  if (!category) notFound()

  const products = await prisma.product.findMany({
    where:   { categoryId: category.id, isActive: true },
    include: { category: true },
    orderBy: { isFeatured: 'desc' },
  })

  return (
    <>
      {/* Hero slider */}
      <CategoryMoodSlider categorySlug={category.slug} categoryName={category.name} />

      {/* Descripción + contador */}
      <div className="bg-brand-bg border-b border-brand-tan/20 py-5">
        <div className="container-velunisa flex items-center justify-between flex-wrap gap-2">
          {category.description && (
            <p className="text-sm text-brand-charcoal/70 max-w-xl">{category.description}</p>
          )}
          <p className="text-xs text-brand-muted ml-auto">
            {products.length} producto{products.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="container-velunisa py-12">
        <ProductGrid
          products={products.map(p => ({
            ...p,
            price:        parseFloat(p.price.toString()),
            comparePrice: p.comparePrice ? parseFloat(p.comparePrice.toString()) : null,
          }))}
          columns={4}
        />
      </div>
      <WhatsAppCTA />
    </>
  )
}
