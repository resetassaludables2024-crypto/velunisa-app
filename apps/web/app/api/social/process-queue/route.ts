import { NextRequest, NextResponse }   from 'next/server'
import { prisma }                      from '@/lib/db'
import { publishInstagramPost }        from '@/lib/instagram'
import { publishTikTokVideo }          from '@/lib/tiktok'

export async function POST(req: NextRequest) {
  // Validate cron secret
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const pending = await prisma.scheduledPost.findMany({
    where: {
      status:      'SCHEDULED',
      scheduledFor: { lte: now },
    },
    include: { product: true },
    take: 10,
  })

  const results = await Promise.allSettled(
    pending.map(async post => {
      const mediaUrls = Array.isArray(post.mediaUrls) ? post.mediaUrls as string[] : []

      try {
        if (post.platform === 'INSTAGRAM' || post.platform === 'BOTH') {
          await publishInstagramPost({
            imageUrl: mediaUrls[0],
            caption:  post.caption,
          })
        }

        if (post.platform === 'TIKTOK' || post.platform === 'BOTH') {
          await publishTikTokVideo({
            videoUrl:    mediaUrls[0],
            title:       post.caption.substring(0, 100),
            description: post.caption,
          })
        }

        await prisma.scheduledPost.update({
          where: { id: post.id },
          data:  { status: 'PUBLISHED', publishedAt: new Date() },
        })

        return { id: post.id, success: true }
      } catch (err: any) {
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data:  { status: 'FAILED', errorLog: err.message ?? String(err) },
        })
        return { id: post.id, success: false, error: err.message }
      }
    })
  )

  const processed = results.filter(r => r.status === 'fulfilled').length
  const failed    = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ processed, failed, total: pending.length })
}
