import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { uploadImage }               from '@/lib/cloudinary'
import { z }                         from 'zod'

const Schema = z.object({
  // Full data URI: "data:image/jpeg;base64,..." — cloudinary accepts this format
  base64:    z.string().min(100),
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
})

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
    // uploadImage accepts a base64 data URI directly
    const { url, publicId } = await uploadImage(parsed.data.base64, 'products')
    return NextResponse.json({ data: { url, publicId } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al subir imagen'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
