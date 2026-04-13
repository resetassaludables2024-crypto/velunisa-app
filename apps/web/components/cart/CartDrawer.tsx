'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart.store'
import { formatPrice, getImageUrl } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty } = useCartStore()
  const total     = items.reduce((sum, i) => sum + (i.variant?.price ?? i.product.price) * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-brand-dark/40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-tan/30">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-charcoal" />
            <h2 className="font-serif text-lg text-brand-charcoal">
              Mi carrito
            </h2>
            {itemCount > 0 && (
              <span className="bg-brand-charcoal text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-brand-charcoal hover:text-brand-red transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 px-8 text-center">
              <ShoppingBag size={48} className="text-brand-tan mb-4" />
              <h3 className="font-serif text-xl text-brand-charcoal mb-2">Tu carrito está vacío</h3>
              <p className="text-sm text-brand-muted mb-6">Agrega algunos wax melts para comenzar 🌸</p>
              <Button variant="primary" onClick={closeCart} asChild>
                <Link href="/tienda">Ver productos</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-brand-tan/20">
              {items.map(item => {
                const price  = item.variant?.price ?? item.product.price
                const imgUrl = getImageUrl(item.product.images)
                return (
                  <li key={item.id} className="flex gap-4 p-5">
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0">
                      <Image src={imgUrl} alt={item.product.name} fill className="object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/tienda/${item.product.slug}`}
                        onClick={closeCart}
                        className="font-medium text-sm text-brand-charcoal hover:text-brand-tan transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-brand-muted mt-0.5">{item.variant.name}</p>
                      )}
                      <p className="text-sm font-semibold text-brand-charcoal mt-1">
                        {formatPrice(price)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-brand-tan flex items-center justify-center hover:bg-brand-cream transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-brand-tan flex items-center justify-center hover:bg-brand-cream transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto p-1.5 text-brand-muted hover:text-brand-red transition-colors"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-brand-tan/30 p-6 space-y-4 bg-brand-bg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-muted">Subtotal</span>
              <span className="font-semibold text-brand-charcoal">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-brand-muted">
              Envío calculado en el siguiente paso
            </p>
            <Button variant="dark" size="lg" className="w-full" asChild>
              <Link href="/checkout" onClick={closeCart}>
                Proceder al pago
              </Link>
            </Button>
            <Button variant="ghost" size="md" className="w-full text-brand-muted" onClick={closeCart} asChild>
              <Link href="/tienda" onClick={closeCart}>
                Continuar comprando
              </Link>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
