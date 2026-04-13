import { MetadataRoute } from 'next'
import { prisma }        from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://velunisa.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where:   { isActive: true },
      select:  { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.category.findMany({
      select:  { slug: true, updatedAt: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:              BASE_URL,
      lastModified:     new Date(),
      changeFrequency:  'daily',
      priority:         1.0,
    },
    {
      url:              `${BASE_URL}/tienda`,
      lastModified:     new Date(),
      changeFrequency:  'daily',
      priority:         0.9,
    },
    {
      url:              `${BASE_URL}/contacto`,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         0.6,
    },
    {
      url:              `${BASE_URL}/faq`,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         0.5,
    },
    {
      url:              `${BASE_URL}/envios`,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         0.5,
    },
    {
      url:              `${BASE_URL}/como-comprar`,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         0.5,
    },
    {
      url:              `${BASE_URL}/privacidad`,
      lastModified:     new Date(),
      changeFrequency:  'yearly',
      priority:         0.3,
    },
    {
      url:              `${BASE_URL}/terminos`,
      lastModified:     new Date(),
      changeFrequency:  'yearly',
      priority:         0.3,
    },
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url:             `${BASE_URL}/categoria/${cat.slug}`,
    lastModified:    cat.updatedAt,
    changeFrequency: 'weekly' as const,
    priority:        0.8,
  }))

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.map(p => ({
    url:             `${BASE_URL}/tienda/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority:        0.85,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
