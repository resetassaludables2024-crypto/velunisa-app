'use client'

import { useState } from 'react'
import { ShoppingBag, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart.store'
import { getImageUrl } from '@/lib/utils'

interface AddToCartButtonProps {
  productId:   string
  productName: string
  price:       number
  slug:        string
  images:      unknown
  comparePrice?: number | null
  variantId?:  string
  variantName?: string
  variantPrice?: number
  className?:  string
  fullWidth?:  boolean
}

export function AddToCartButton({
  productId, productName, price, slug, images,
  comparePrice = null, variantId, variantName, variantPrice, className, fullWidth,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  function handleAdd() {
    addItem(
      {
        id:           productId,
        name:         productName,
        slug,
        price,
        comparePrice: comparePrice ?? null,
        images:       Array.isArray(images) ? images : [],
      },
      variantId ? {
        id:    variantId,
        name:  variantName ?? '',
        price: variantPrice ?? price,
      } : null
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button
      variant={added ? 'secondary' : 'primary'}
      size="sm"
      onClick={handleAdd}
      className={`${fullWidth ? 'w-full' : 'w-full'} ${className ?? ''}`}
    >
      {added ? (
        <>
          <Check size={14} />
          Agregado
        </>
      ) : (
        <>
          <ShoppingBag size={14} />
          Agregar
        </>
      )}
    </Button>
  )
}
