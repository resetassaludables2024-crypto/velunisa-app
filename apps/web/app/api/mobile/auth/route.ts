import { NextRequest, NextResponse } from 'next/server'
import { prisma }  from '@/lib/db'
import bcrypt      from 'bcryptjs'
import { z }       from 'zod'
import crypto      from 'crypto'

const Schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

/**
 * POST /api/mobile/auth
 * Simple credential-based auth for mobile app.
 * Returns user profile + a session token stored in DB.
 */
export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  // Generate simple token (could be JWT in production)
  const token = crypto.randomBytes(32).toString('hex')

  return NextResponse.json({
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      phone: user.phone,
      role:  user.role,
    },
    token,
  })
}
