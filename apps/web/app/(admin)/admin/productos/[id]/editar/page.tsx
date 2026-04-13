import { notFound }   from 'next/navigation'
import { prisma }     from '@/lib/db'
import type { Metadata } from 'next'
import { EditarProductoClient } from './EditarProductoClient'

interface PageProps { params: { id: string } }

export const metadata: Metadata = { title: 'Editar producto' }

export default async function EditarProductoPage({ params }: PageProps) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where:   { id: params.id },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!product) notFound()

  const images = (() => {
    if (Array.isArray(product.images)) return product.images as string[]
    try { return JSON.parse(product.images as unknown as string) as string[] }
    catch { return [] }
  })()

  return (
    <EditarProductoClient
      product={{
        id:           product.id,
        name:         product.name,
        slug:         product.slug,
        description:  product.description ?? '',
        price:        parseFloat(product.price.toString()),
        comparePrice: product.comparePrice ? parseFloat(product.comparePrice.toString()) : null,
        stock:        product.stock,
        sku:          product.sku,
        images,
        categoryId:   product.categoryId,
        isNew:        product.isNew,
        isFeatured:   product.isFeatured,
        isActive:     product.isActive,
      }}
      categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))}
    />
  )
}
