import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/db'
import { z }                         from 'zod'

const Schema = z.object({
  name:  z.string().min(2, 'Nombre muy corto'),
  phone: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data:  { name: parsed.data.name, phone: parsed.data.phone ?? null },
    select: { id: true, name: true, phone: true, email: true },
  })

  return NextResponse.json({ data: user })
}
