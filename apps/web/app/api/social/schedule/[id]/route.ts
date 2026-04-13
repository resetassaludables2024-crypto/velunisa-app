import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/db'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const post = await prisma.scheduledPost.findUnique({ where: { id: params.id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (post.status === 'PUBLISHED') {
    return NextResponse.json(
      { error: 'No se puede eliminar una publicación ya publicada' },
      { status: 409 }
    )
  }

  await prisma.scheduledPost.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
