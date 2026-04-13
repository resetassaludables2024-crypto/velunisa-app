import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/db'
import { z }                         from 'zod'

const CreateProductSchema = z.object({
  name:         z.string().min(1),
  slug:         z.string().min(1),
  description:  z.string().min(1),
  price:        z.number().positive(),
  comparePrice: z.number().positive().optional(),
  images:       z.array(z.string().url()),
  stock:        z.number().int().min(0).default(0),
  sku:          z.string().min(1),
  isNew:        z.boolean().default(false),
  isFeatured:   z.boolean().default(false),
  categoryId:   z.string().cuid(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const where: any = { isActive: true }

  if (searchParams.get('category'))   where.category    = { slug: searchParams.get('category') }
  if (searchParams.get('isNew'))      where.isNew       = true
  if (searchParams.get('isFeatured')) where.isFeatured  = true
  if (searchParams.get('q')) {
    where.OR = [
      { name:        { contains: searchParams.get('q') ?? '' } },
      { description: { contains: searchParams.get('q') ?? '' } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true, variants: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: products })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json()
  const parsed = CreateProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { images, ...rest } = parsed.data
  const product = await prisma.product.create({
    data:    { ...rest, images: JSON.stringify(images) },
    include: { category: true },
  })

  return NextResponse.json({ data: product }, { status: 201 })
}
