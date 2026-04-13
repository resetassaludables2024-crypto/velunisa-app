import { notFound }           from 'next/navigation'
import Link                   from 'next/link'
import { prisma }             from '@/lib/db'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { Badge }              from '@/components/ui/Badge'
import { ProductVariantSelector }  from '@/components/product/ProductVariantSelector'
import { ProductImageGallery }     from '@/components/product/ProductImageGallery'
import { WhatsAppCTA }        from '@/components/home/WhatsAppCTA'
import { ProductGrid }        from '@/components/product/ProductGrid'
import type { Metadata }      from 'next'

interface PageProps { params: { slug: string } }

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where:   { slug, isActive: true },
    include: { category: true, variants: true },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Producto no encontrado' }
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://velunisa.com'
  const imgUrl  = getImageUrl(product.images)
  const price   = parseFloat(product.price.toString())
  return {
    title:       `${product.name} | Velunisa`,
    description: product.description.substring(0, 160),
    keywords:    [
      product.name,
      'wax melt',
      'cera aromatica',
      product.category.name,
      'Ecuador',
      'Velunisa',
    ],
    openGraph: {
      type:        'website',
      title:       product.name,
      description: product.description.substring(0, 160),
      url:         `${appUrl}/tienda/${product.slug}`,
      siteName:    'Velunisa',
      locale:      'es_EC',
      images: [{
        url:    imgUrl,
        width:  800,
        height: 800,
        alt:    product.name,
      }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       product.name,
      description: product.description.substring(0, 160),
      images:      [imgUrl],
    },
    alternates: {
      canonical: `${appUrl}/tienda/${product.slug}`,
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const price        = parseFloat(product.price.toString())
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice.toString()) : null
  const images       = Array.isArray(product.images) ? product.images as string[] : []
  const hasDiscount  = comparePrice && comparePrice > price

  // Related products
  const related = await prisma.product.findMany({
    where:   { categoryId: product.categoryId, isActive: true, NOT: { id: product.id } },
    include: { category: true },
    take:    4,
  })

  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://velunisa.com'
  const imgArray = images.length > 0 ? images : [getImageUrl(product.images)]

  const jsonLd = {
    '@context':   'https://schema.org',
    '@type':      'Product',
    name:         product.name,
    description:  product.description,
    image:        imgArray,
    sku:          product.sku,
    brand: {
      '@type': 'Brand',
      name:    'Velunisa',
    },
    offers: {
      '@type':         'Offer',
      url:             `${appUrl}/tienda/${product.slug}`,
      priceCurrency:   'USD',
      price:           price.toFixed(2),
      availability:    product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition:   'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name:    'Velunisa',
      },
    },
    ...(comparePrice ? {
      offers: {
        '@type':         'AggregateOffer',
        lowPrice:        price.toFixed(2),
        highPrice:       comparePrice.toFixed(2),
        priceCurrency:   'USD',
      },
    } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-velunisa py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-brand-muted mb-8">
          <Link href="/"      className="hover:text-brand-charcoal transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/tienda" className="hover:text-brand-charcoal transition-colors">Tienda</Link>
          <span>/</span>
          <Link href={`/categoria/${product.category.slug}`} className="hover:text-brand-charcoal transition-colors">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-brand-charcoal">{product.name}</span>
        </nav>

        {/* Product grid */}
        <div className="grid laptop:grid-cols-2 gap-12 laptop:gap-16">
          {/* Images */}
          <div className="relative">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {product.isNew  && <Badge variant="nuevo">Nuevo</Badge>}
              {hasDiscount    && <Badge variant="oferta">Oferta</Badge>}
            </div>
            <ProductImageGallery images={images} productName={product.name} />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <Link href={`/categoria/${product.category.slug}`} className="text-xs text-brand-muted uppercase tracking-widest hover:text-brand-tan transition-colors">
                {product.category.name}
              </Link>
              <h1 className="font-serif text-3xl laptop:text-4xl text-brand-charcoal mt-2 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-brand-charcoal">{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="text-lg text-brand-muted line-through">{formatPrice(comparePrice!)}</span>
              )}
            </div>

            {/* Description */}
            <div className="text-sm text-brand-dark/70 leading-relaxed border-t border-brand-tan/20 pt-6">
              {product.description}
            </div>

            {/* Variants + Add to Cart */}
            <ProductVariantSelector
              product={{
                id:           product.id,
                name:         product.name,
                slug:         product.slug,
                price,
                comparePrice: comparePrice ?? null,
                images:       images,
              }}
              variants={product.variants.map(v => ({
                id:    v.id,
                name:  v.name,
                price: parseFloat(v.price.toString()),
                stock: v.stock,
              }))}
            />

            {/* Stock info */}
            <p className="text-xs text-brand-muted">
              {product.stock > 10
                ? `✅ En stock (${product.stock} disponibles)`
                : product.stock > 0
                  ? `⚠️ Últimas ${product.stock} unidades`
                  : '❌ Agotado'}
            </p>

            {/* Trust badges */}
            <div className="border-t border-brand-tan/20 pt-6 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: '🌿', label: '100% Natural' },
                { icon: '✋', label: 'Hecho a mano' },
                { icon: '🚚', label: 'Envío nacional' },
              ].map(b => (
                <div key={b.label} className="space-y-1">
                  <div className="text-xl">{b.icon}</div>
                  <p className="text-[11px] text-brand-muted">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl text-brand-charcoal mb-8">También te puede gustar</h2>
            <ProductGrid
              products={related.map(p => ({
                ...p,
                price:        parseFloat(p.price.toString()),
                comparePrice: p.comparePrice ? parseFloat(p.comparePrice.toString()) : null,
              }))}
              columns={4}
            />
          </div>
        )}
      </div>
      <WhatsAppCTA />
    </>
  )
}
