import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/db'

export async function POST(req: NextRequest) {
  // Validate API key header
  const apiKey = req.headers.get('x-manychat-key')
  if (apiKey !== process.env.MANYCHAT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await req.json()

  // Log the event
  await prisma.webhookEvent.create({
    data: {
      source:    'manychat',
      eventType: payload.event_type ?? 'unknown',
      payload,
    },
  })

  // Process subscriber data
  const subscriber = payload.subscriber
  if (subscriber?.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: subscriber.email },
    })

    if (!existingUser && subscriber.email) {
      // Create a customer record from ManyChat subscriber
      await prisma.user.upsert({
        where: { email: subscriber.email },
        update: {
          phone: subscriber.phone_number ?? undefined,
          name:  subscriber.name ?? undefined,
        },
        create: {
          email: subscriber.email,
          name:  subscriber.name ?? null,
          phone: subscriber.phone_number ?? null,
          role:  'CUSTOMER',
        },
      })
    }
  }

  return NextResponse.json({ success: true })
}
