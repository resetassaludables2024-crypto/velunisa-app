import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/db'
import bcrypt                        from 'bcryptjs'
import { z }                         from 'zod'

const Schema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
  phone:    z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12)

  const user = await prisma.user.create({
    data: {
      name:     parsed.data.name,
      email:    parsed.data.email,
      password: hashed,
      phone:    parsed.data.phone ?? null,
      role:     'CUSTOMER',
    },
    select: { id: true, email: true, name: true },
  })

  return NextResponse.json({ data: user }, { status: 201 })
}
