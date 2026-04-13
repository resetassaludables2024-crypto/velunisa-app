import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/db'
import { z }                         from 'zod'

const PatchSchema = z.object({
  isActive:     z.boolean().optional(),
  isNew:        z.boolean().optional(),
  isFeatured:   z.boolean().optional(),
  name:         z.string().min(1).optional(),
  slug:         z.string().min(1).optional(),
  description:  z.string().optional(),
  price:        z.number().positive().optional(),
  comparePrice: z.number().positive().nullable().optional(),
  stock:        z.number().int().min(0).optional(),
  sku:          z.string().min(1).optional(),
  images:       z.array(z.string()).optional(),
  categoryId:   z.string().min(1).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { categoryId, images, ...rest } = parsed.data

  const product = await prisma.product.update({
    where: { id: params.id },
    data:  {
      ...rest,
      ...(images     ? { images: JSON.stringify(images) as any }      : {}),
      ...(categoryId ? { category: { connect: { id: categoryId } } }  : {}),
    },
  })

  return NextResponse.json({ data: product })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
