import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/db'
import { z }                         from 'zod'
import { generateOrderNumber }       from '@/lib/utils'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { sendOrderConfirmation }      from '@/lib/whatsapp'

const ShippingAddressSchema = z.object({
  firstName:  z.string().min(1),
  lastName:   z.string().min(1),
  phone:      z.string().min(7),
  address:    z.string().min(5),
  city:       z.string().min(1),
  province:   z.string().min(1),
  postalCode: z.string().optional(),
})

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity:  z.number().int().positive(),
  })).min(1),
  shippingAddress: ShippingAddressSchema,
  guestEmail:  z.string().email().optional(),
  notes:       z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id as string | undefined

  const body   = await req.json()
  const parsed = CreateOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { items, shippingAddress, guestEmail, notes } = parsed.data

  // Fetch products & calculate totals
  const orderItems = await Promise.all(
    items.map(async item => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      })
      if (!product) throw new Error(`Product ${item.productId} not found`)

      const variant = item.variantId
        ? product.variants.find(v => v.id === item.variantId)
        : null

      const price = variant
        ? parseFloat(variant.price.toString())
        : parseFloat(product.price.toString())

      return {
        productId: item.productId,
        variantId: item.variantId ?? null,
        name:      product.name,
        price,
        quantity:  item.quantity,
        image:     Array.isArray(product.images) ? (product.images as string[])[0] ?? '' : '',
      }
    })
  )

  const subtotal     = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shippingCost = 0  // Free shipping or calculated later
  const total        = subtotal + shippingCost

  // Generate unique order number
  let orderNumber = generateOrderNumber()
  while (await prisma.order.findUnique({ where: { orderNumber } })) {
    orderNumber = generateOrderNumber()
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId:          userId ?? null,
      guestEmail:      guestEmail ?? null,
      guestPhone:      shippingAddress.phone,
      shippingAddress: shippingAddress as any,
      subtotal,
      shippingCost,
      total,
      notes: notes ?? null,
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  })

  // Send notifications (non-blocking)
  const email = userId
    ? (await prisma.user.findUnique({ where: { id: userId } }))?.email
    : guestEmail

  if (email) {
    const bankDetails = {
      bankName:      process.env.BANK_NAME      ?? 'Banco Pichincha',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? '',
      accountOwner:  process.env.BANK_ACCOUNT_OWNER  ?? 'Velunisa',
      accountType:   process.env.BANK_ACCOUNT_TYPE   ?? 'Corriente',
    }
    sendOrderConfirmationEmail({
      to:          email,
      orderNumber,
      items:       order.items.map(i => ({ name: i.name, quantity: i.quantity, price: parseFloat(i.price.toString()) })),
      total,
      shippingAddress,
      bankDetails,
    }).catch(console.error)
  }

  // WhatsApp notification
  const phone = shippingAddress.phone
  if (phone) {
    sendOrderConfirmation(phone, {
      orderNumber,
      total,
      items: order.items.map(i => ({ name: i.name, quantity: i.quantity })),
    }).catch(console.error)
  }

  return NextResponse.json({ data: { orderNumber, total, id: order.id } }, { status: 201 })
}
