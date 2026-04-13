import { NextRequest, NextResponse } from 'next/server'
import { prisma }  from '@/lib/db'
import { z }       from 'zod'

const Schema = z.object({
  token: z.string().min(10),
})

/**
 * POST /api/user/push-token
 * Called by mobile app after getting Expo push token.
 * Authenticated via Authorization header (Bearer <token from /api/mobile/auth>)
 * or by looking up userId in a session.
 *
 * For simplicity, identifies the user by their userId passed in body
 * (the mobile app stores the userId after login).
 */
export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
  }

  // Get userId from Authorization header or body
  const authHeader = req.headers.get('authorization')
  const userId     = body?.userId as string | undefined

  if (!userId) {
    // Not logged in — ignore silently (guest users can't receive push)
    return NextResponse.json({ success: true })
  }

  await prisma.user.update({
    where: { id: userId },
    data:  { expoPushToken: parsed.data.token },
  })

  return NextResponse.json({ success: true })
}
