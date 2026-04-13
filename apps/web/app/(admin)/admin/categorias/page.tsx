import { prisma }   from '@/lib/db'
import type { Metadata } from 'next'
import { CategoriasClient } from './CategoriasClient'

export const metadata: Metadata = { title: 'Admin — Categorías' }

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  return <CategoriasClient categories={categories} />
}
