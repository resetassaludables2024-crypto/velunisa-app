import { create }         from 'zustand'
import { persist }        from 'zustand/middleware'
import { MMKV }           from 'react-native-mmkv'

// MMKV con fallback a memoria si falla la inicialización nativa
let storage: MMKV | null = null
try {
  storage = new MMKV({ id: 'velunisa-cart' })
} catch (e) {
  console.warn('[Cart] MMKV init failed, using in-memory storage:', e)
}

const inMemory: Record<string, string> = {}

const mmkvStorage = {
  getItem:    (key: string) => storage ? (storage.getString(key) ?? null) : (inMemory[key] ?? null),
  setItem:    (key: string, value: string) => storage ? storage.set(key, value) : (inMemory[key] = value),
  removeItem: (key: string) => storage ? storage.delete(key) : delete inMemory[key],
}

export interface MobileCartProduct {
  id:           string
  name:         string
  slug:         string
  price:        number
  comparePrice: number | null
  images:       string[]
}

export interface MobileCartItem {
  id:        string
  productId: string
  variantId: string | null
  quantity:  number
  product:   MobileCartProduct
  variant:   { id: string; name: string; price: number } | null
}

interface CartStore {
  items:      MobileCartItem[]
  addItem:    (product: MobileCartProduct, variant: CartStore['items'][0]['variant'], qty?: number) => void
  removeItem: (itemId: string) => void
  updateQty:  (itemId: string, qty: number) => void
  clearCart:  () => void
  total:      number
  itemCount:  number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      get total() {
        return get().items.reduce(
          (sum, i) => sum + (i.variant?.price ?? i.product.price) * i.quantity,
          0
        )
      },

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      addItem(product, variant, qty = 1) {
        const id = variant ? `${product.id}-${variant.id}` : product.id
        set(state => {
          const existing = state.items.find(i => i.id === id)
          if (existing) {
            return { items: state.items.map(i => i.id === id ? { ...i, quantity: i.quantity + qty } : i) }
          }
          return {
            items: [...state.items, { id, productId: product.id, variantId: variant?.id ?? null, quantity: qty, product, variant }],
          }
        })
      },

      removeItem(id) {
        set(state => ({ items: state.items.filter(i => i.id !== id) }))
      },

      updateQty(id, qty) {
        if (qty <= 0) { get().removeItem(id); return }
        set(state => ({ items: state.items.map(i => i.id === id ? { ...i, quantity: qty } : i) }))
      },

      clearCart() {
        set({ items: [] })
      },
    }),
    {
      name:    'velunisa-cart',
      storage: mmkvStorage as any,
      partialize: state => ({ items: state.items }),
    }
  )
)
