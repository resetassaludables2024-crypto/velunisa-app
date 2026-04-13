'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageGalleryProps {
  images:      string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="product-image-wrapper relative aspect-square rounded-2xl overflow-hidden bg-brand-bg flex items-center justify-center">
        <span className="text-6xl">🕯️</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="product-image-wrapper relative aspect-square rounded-2xl overflow-hidden bg-brand-bg">
        <Image
          src={images[active]}
          alt={productName}
          fill
          className="object-cover transition-opacity duration-300"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`product-image-wrapper relative aspect-square rounded-lg overflow-hidden bg-brand-bg border-2 transition-colors duration-200 ${
                active === i ? 'border-brand-charcoal' : 'border-transparent hover:border-brand-tan'
              }`}
            >
              <Image src={img} alt={`${productName} ${i + 1}`} fill className="object-cover" sizes="25vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
