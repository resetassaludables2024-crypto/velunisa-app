import type { Metadata }        from 'next'
import { prisma }                from '@/lib/db'
import { NuevoProductoClient }   from './NuevoProductoClient'

export const metadata: Metadata = { title: 'Admin — Nuevo producto' }

async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
}

export default async function NuevoProductoPage() {
  const categories = await getCategories()
  return <NuevoProductoClient categories={categories} />
}
