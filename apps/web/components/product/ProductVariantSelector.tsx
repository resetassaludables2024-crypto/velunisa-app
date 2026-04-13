'use client'

import { useState } from 'react'
import { cn, formatPrice } from '@/lib/utils'
import { AddToCartButton }  from './AddToCartButton'

interface Variant {
  id:    string
  name:  string
  price: number
  stock: number
}

interface ProductVariantSelectorProps {
  product: {
    id:           string
    name:         string
    slug:         string
    price:        number
    comparePrice: number | null
    images:       string[]
  }
  variants: Variant[]
}

export function ProductVariantSelector({ product, variants }: ProductVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants.length > 0 ? variants[0] : null
  )

  const currentPrice = selectedVariant?.price ?? product.price

  return (
    <div className="space-y-5">
      {/* Variant selector */}
      {variants.length > 0 && (
        <div>
          <p className="text-sm font-medium text-brand-charcoal mb-3">
            Presentación:{' '}
            <span className="font-semibold text-brand-tan">
              {selectedVariant?.name} — {formatPrice(currentPrice)}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map(variant => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={variant.stock === 0}
                className={cn(
                  'px-4 py-2 text-sm rounded-pill border transition-all duration-200',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  selectedVariant?.id === variant.id
                    ? 'bg-brand-charcoal text-white border-brand-charcoal'
                    : 'border-brand-tan text-brand-charcoal hover:border-brand-charcoal hover:bg-brand-cream'
                )}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add to cart */}
      <AddToCartButton
        productId={product.id}
        productName={product.name}
        price={product.price}
        comparePrice={product.comparePrice}
        slug={product.slug}
        images={product.images}
        variantId={selectedVariant?.id}
        variantName={selectedVariant?.name}
        variantPrice={selectedVariant?.price}
        fullWidth
      />
    </div>
  )
}
