import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/db'
import { z }                         from 'zod'

const Schema = z.object({
  platform:    z.enum(['INSTAGRAM', 'TIKTOK', 'BOTH']),
  caption:     z.string().min(1).max(2200),
  mediaUrls:   z.array(z.string()).min(1),
  scheduledFor: z.string().datetime(),
  productId:   z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { mediaUrls, platform, ...rest } = parsed.data
  const post = await prisma.scheduledPost.create({
    data: {
      ...rest,
      platform:     platform as string,
      mediaUrls:    JSON.stringify(mediaUrls),
      scheduledFor: new Date(parsed.data.scheduledFor),
      productId:    parsed.data.productId ?? null,
    },
  })

  return NextResponse.json({ data: post }, { status: 201 })
}
