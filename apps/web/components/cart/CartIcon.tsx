'use client'

import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'

export function CartIcon() {
  const { items, toggleCart } = useCartStore()
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 hover:text-brand-tan transition-colors duration-200"
      aria-label={`Carrito (${count} items)`}
    >
      <ShoppingBag size={22} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-brand-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center leading-none px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
