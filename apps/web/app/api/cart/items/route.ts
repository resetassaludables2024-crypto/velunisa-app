import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/db'
import { z }                         from 'zod'

const AddItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity:  z.number().int().positive().default(1),
  sessionId: z.string().optional(),
})

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    return prisma.cart.upsert({
      where:  { userId },
      update: {},
      create: { userId },
      include: { items: { include: { product: true, variant: true } } },
    })
  }
  if (sessionId) {
    return prisma.cart.upsert({
      where:  { sessionId },
      update: {},
      create: { sessionId },
      include: { items: { include: { product: true, variant: true } } },
    })
  }
  throw new Error('Need userId or sessionId')
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id

  const body   = await req.json()
  const parsed = AddItemSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const cart = await getOrCreateCart(userId, parsed.data.sessionId)

  // Upsert cart item
  const existing = cart.items.find(
    i => i.productId === parsed.data.productId && i.variantId === (parsed.data.variantId ?? null)
  )

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data:  { quantity: existing.quantity + parsed.data.quantity },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId:    cart.id,
        productId: parsed.data.productId,
        variantId: parsed.data.variantId ?? null,
        quantity:  parsed.data.quantity,
      },
    })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id

  const body      = await req.json()
  const { itemId, quantity, sessionId } = body

  const cart = await getOrCreateCart(userId, sessionId)
  const item = cart.items.find(i => i.id === itemId)
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } })
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const itemId           = searchParams.get('itemId')
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })

  await prisma.cartItem.delete({ where: { id: itemId } })
  return NextResponse.json({ success: true })
}
