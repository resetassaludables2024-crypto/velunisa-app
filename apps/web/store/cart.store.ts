'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartProduct {
  id:          string
  name:        string
  slug:        string
  price:       number
  comparePrice: number | null
  images:      string[]
}

export interface CartVariant {
  id:    string
  name:  string
  price: number
}

export interface StoreCartItem {
  id:        string  // cartItemId = productId + variantId
  productId: string
  variantId: string | null
  quantity:  number
  product:   CartProduct
  variant:   CartVariant | null
}

interface CartStore {
  items:     StoreCartItem[]
  isOpen:    boolean

  // Computed
  total:     number
  itemCount: number

  // Actions
  addItem:    (product: CartProduct, variant: CartVariant | null, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQty:  (itemId: string, quantity: number) => void
  clearCart:  () => void
  openCart:   () => void
  closeCart:  () => void
  toggleCart: () => void
}

function buildItemId(productId: string, variantId: string | null): string {
  return variantId ? `${productId}-${variantId}` : productId
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:  [],
      isOpen: false,

      get total() {
        return get().items.reduce((sum, item) => {
          const price = item.variant?.price ?? item.product.price
          return sum + price * item.quantity
        }, 0)
      },

      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      addItem(product, variant, quantity = 1) {
        const itemId = buildItemId(product.id, variant?.id ?? null)
        set(state => {
          const existing = state.items.find(i => i.id === itemId)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === itemId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
            }
          }
          return {
            items: [
              ...state.items,
              {
                id:        itemId,
                productId: product.id,
                variantId: variant?.id ?? null,
                quantity,
                product,
                variant: variant ?? null,
              },
            ],
            isOpen: true,
          }
        })
      },

      removeItem(itemId) {
        set(state => ({
          items: state.items.filter(i => i.id !== itemId),
        }))
      },

      updateQty(itemId, quantity) {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart() {
        set({ items: [] })
      },

      openCart()   { set({ isOpen: true }) },
      closeCart()  { set({ isOpen: false }) },
      toggleCart() { set(state => ({ isOpen: !state.isOpen })) },
    }),
    {
      name:    'velunisa-cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      partialize: state => ({ items: state.items }),
    }
  )
)
