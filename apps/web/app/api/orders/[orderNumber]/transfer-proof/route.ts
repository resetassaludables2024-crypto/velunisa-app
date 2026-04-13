import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/db'
import { uploadImage }               from '@/lib/cloudinary'
import { z }                         from 'zod'

const Schema = z.object({
  imageBase64:    z.string().optional(),
  bankTransferRef: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const body   = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  let proofUrl: string | undefined
  if (parsed.data.imageBase64) {
    const { url } = await uploadImage(parsed.data.imageBase64, 'transfer-proofs')
    proofUrl = url
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      ...(proofUrl ? { transferProof: proofUrl } : {}),
      bankTransferRef: parsed.data.bankTransferRef ?? null,
      paymentStatus:   'TRANSFER_SUBMITTED',
    },
  })

  return NextResponse.json({ success: true, proofUrl: proofUrl ?? null })
}
