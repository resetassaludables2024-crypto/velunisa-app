import { Suspense }    from 'react'
import { prisma }      from '@/lib/db'
import { SocialSchedulerClient } from '@/components/admin/SocialSchedulerClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Publicaciones' }

async function getScheduledPosts() {
  return prisma.scheduledPost.findMany({
    orderBy: { scheduledFor: 'desc' },
    include: { product: { select: { name: true, slug: true } } },
    take:    50,
  })
}

export default async function PublicacionesPage() {
  const posts = await getScheduledPosts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl text-brand-charcoal">Publicaciones</h1>
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <SocialSchedulerClient posts={posts.map(p => ({
          ...p,
          mediaUrls:   Array.isArray(p.mediaUrls) ? p.mediaUrls as string[] : [],
          scheduledFor: p.scheduledFor.toISOString(),
          publishedAt:  p.publishedAt?.toISOString() ?? null,
          createdAt:    p.createdAt.toISOString(),
          updatedAt:    p.updatedAt.toISOString(),
          product:      p.product,
        }))} />
      </Suspense>
    </div>
  )
}
