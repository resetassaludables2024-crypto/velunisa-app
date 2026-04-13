// ============================================================
// VELUNISA - Shared TypeScript Types
// ============================================================

export type Role = 'CUSTOMER' | 'ADMIN'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus =
  | 'AWAITING_TRANSFER'
  | 'TRANSFER_SUBMITTED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REFUNDED'

export type SocialPlatform = 'INSTAGRAM' | 'TIKTOK' | 'BOTH'

export type PostStatus = 'SCHEDULED' | 'PUBLISHED' | 'FAILED'

// ------------------------------------------------------------
// Category
// ------------------------------------------------------------
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  sortOrder: number
}

// ------------------------------------------------------------
// Product
// ------------------------------------------------------------
export interface ProductVariant {
  id: string
  productId: string
  name: string
  price: number
  stock: number
  sku: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  images: string[]
  stock: number
  sku: string
  isActive: boolean
  isNew: boolean
  isFeatured: boolean
  categoryId: string
  category?: Category
  variants?: ProductVariant[]
  createdAt: string
  updatedAt: string
}

// ------------------------------------------------------------
// Cart
// ------------------------------------------------------------
export interface CartItem {
  id: string
  productId: string
  variantId: string | null
  quantity: number
  product: Pick<Product, 'id' | 'name' | 'price' | 'comparePrice' | 'images' | 'slug'>
  variant?: Pick<ProductVariant, 'id' | 'name' | 'price'> | null
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
  itemCount: number
}

// ------------------------------------------------------------
// Address
// ------------------------------------------------------------
export interface Address {
  id: string
  userId: string
  label: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string | null
  isDefault: boolean
}

// ------------------------------------------------------------
// Order
// ------------------------------------------------------------
export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId: string | null
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string | null
  guestEmail: string | null
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: Address
  bankTransferRef: string | null
  transferProof: string | null
  confirmedAt: string | null
  notes: string | null
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

// ------------------------------------------------------------
// Chat
// ------------------------------------------------------------
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: {
    productSlugs?: string[]
  }
  createdAt: string
}

// ------------------------------------------------------------
// Social
// ------------------------------------------------------------
export interface ScheduledPost {
  id: string
  platform: SocialPlatform
  caption: string
  mediaUrls: string[]
  scheduledFor: string
  status: PostStatus
  productId: string | null
  publishedAt: string | null
  errorLog: string | null
  createdAt: string
}

// ------------------------------------------------------------
// API Response
// ------------------------------------------------------------
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ------------------------------------------------------------
// Ecuador Provinces
// ------------------------------------------------------------
export const ECUADOR_PROVINCES = [
  'Azuay',
  'Bolívar',
  'Cañar',
  'Carchi',
  'Chimborazo',
  'Cotopaxi',
  'El Oro',
  'Esmeraldas',
  'Galápagos',
  'Guayas',
  'Imbabura',
  'Loja',
  'Los Ríos',
  'Manabí',
  'Morona Santiago',
  'Napo',
  'Orellana',
  'Pastaza',
  'Pichincha',
  'Santa Elena',
  'Santo Domingo de los Tsáchilas',
  'Sucumbíos',
  'Tungurahua',
  'Zamora Chinchipe',
] as const

export type EcuadorProvince = (typeof ECUADOR_PROVINCES)[number]
