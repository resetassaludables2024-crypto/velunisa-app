import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('es-EC', {
    style:    'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num)
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export function generateOrderNumber(): string {
  const year   = new Date().getFullYear()
  const random = Math.floor(Math.random() * 90000) + 10000
  return `VEL-${year}-${random}`
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function getImageUrl(images: unknown, index = 0): string {
  if (!images) return '/images/placeholder.jpg'
  const arr = Array.isArray(images) ? images : []
  return arr[index] ?? '/images/placeholder.jpg'
}
