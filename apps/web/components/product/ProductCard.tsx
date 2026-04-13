import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { AddToCartButton } from './AddToCartButton'

interface ProductCardProps {
  id:           string
  name:         string
  slug:         string
  price:        number | string
  comparePrice: number | string | null
  images:       unknown
  isNew:        boolean
  categoryName?: string
}

export function ProductCard({
  id, name, slug, price, comparePrice, images, isNew, categoryName,
}: ProductCardProps) {
  const imageUrl = getImageUrl(images)
  const priceNum = typeof price === 'string' ? parseFloat(price) : price
  const comparePriceNum = comparePrice
    ? typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice
    : null
  const hasDiscount = comparePriceNum && comparePriceNum > priceNum

  return (
    <article className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-400 border border-brand-tan/20">
      {/* Image */}
      <Link href={`/tienda/${slug}`} className="block">
        <div className="product-image-wrapper relative aspect-square bg-brand-bg overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1124px) 33vw, 25vw"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew        && <Badge variant="nuevo">Nuevo</Badge>}
            {hasDiscount  && <Badge variant="oferta">Oferta</Badge>}
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {categoryName && (
          <p className="text-[11px] text-brand-muted uppercase tracking-widest mb-1">
            {categoryName}
          </p>
        )}
        <Link href={`/tienda/${slug}`}>
          <h3 className="font-serif text-base font-semibold text-brand-charcoal line-clamp-2 hover:text-brand-tan transition-colors duration-200 mb-2">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base font-bold text-brand-charcoal">
            {formatPrice(priceNum)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-brand-muted line-through">
              {formatPrice(comparePriceNum!)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <AddToCartButton productId={id} productName={name} price={priceNum} slug={slug} images={images} />
      </div>
    </article>
  )
}
