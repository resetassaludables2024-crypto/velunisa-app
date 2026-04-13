import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { analyzeProductImage }       from '@/lib/claude'
import { z }                         from 'zod'

const ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

const Schema = z.discriminatedUnion('sourceType', [
  z.object({
    sourceType: z.literal('url'),
    url:        z.string().url(),
  }),
  z.object({
    sourceType: z.literal('base64'),
    data:       z.string().min(100),
    mediaType:  z.enum(ALLOWED_MEDIA_TYPES),
  }),
])

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const result = await analyzeProductImage(
      parsed.data.sourceType === 'url'
        ? { type: 'url', url: parsed.data.url }
        : { type: 'base64', data: parsed.data.data, mediaType: parsed.data.mediaType }
    )
    return NextResponse.json({ data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al analizar imagen'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
