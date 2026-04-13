import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/db'
import Anthropic                     from '@anthropic-ai/sdk'
import { z }                         from 'zod'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const Schema = z.object({
  imageUrl:  z.string().url(),
  platform:  z.enum(['INSTAGRAM', 'TIKTOK', 'BOTH']),
  productId: z.string().optional(),
  tone:      z.enum(['elegante', 'festivo', 'romantico', 'tierno']).default('elegante'),
})

const PLATFORM_CONSTRAINTS: Record<string, string> = {
  INSTAGRAM: 'Caption para Instagram: máximo 2200 caracteres, usa emojis con elegancia, incluye 10-15 hashtags al final en bloque separado.',
  TIKTOK:    'Caption para TikTok: máximo 150 caracteres antes de "Ver más", muy directo y con llamada a la acción, 3-5 hashtags trending.',
  BOTH:      'Caption versátil que funcione en Instagram y TikTok. Empieza con una frase gancho corta. Incluye 8-10 hashtags.',
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { imageUrl, platform, productId, tone } = parsed.data

  // Optionally enrich prompt with product data
  let productContext = ''
  if (productId) {
    const product = await prisma.product.findUnique({
      where:   { id: productId },
      include: { category: true },
    })
    if (product) {
      productContext = `\nProducto: ${product.name}\nCategoría: ${product.category.name}\nDescripción: ${product.description.substring(0, 200)}\nPrecio: $${product.price}`
    }
  }

  const toneGuides: Record<string, string> = {
    elegante: 'Tono sofisticado, evocador, sensorial. Palabras que inspiren lujo accesible y bienestar.',
    festivo:  'Tono alegre, celebratorio, energético. Ideal para cumpleaños y fiestas.',
    romantico:'Tono íntimo, cálido, poético. Perfecto para bodas y momentos de pareja.',
    tierno:   'Tono dulce, maternal, emotivo. Ideal para baby shower y regalos familiares.',
  }

  const systemPrompt = `Eres el community manager de Velunisa, marca premium de wax melts artesanales en Ecuador.
Conoces profundamente la marca: productos de cera de soya con aceites esenciales, diseños únicos para ocasiones especiales.
Siempre escribes en español latinoamericano. La cuenta de Instagram es @velunisa_oficial.
${toneGuides[tone]}
${PLATFORM_CONSTRAINTS[platform]}

Hashtags base a incluir siempre: #velunisa #waxmelts #cerasaromaticas #ecuador #tiendaecuador #regalosecuador

Devuelve ÚNICAMENTE el caption listo para copiar y pegar. Sin explicaciones, sin comillas, sin markdown.`

  // Download image and convert to base64
  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) {
    return NextResponse.json({ error: 'No se pudo descargar la imagen' }, { status: 400 })
  }
  const imgBuffer = await imgRes.arrayBuffer()
  const imgBase64 = Buffer.from(imgBuffer).toString('base64')
  const mimeRaw   = imgRes.headers.get('content-type') ?? 'image/jpeg'
  const mime      = mimeRaw.split(';')[0].trim()
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
  type AllowedMime = typeof allowedMimes[number]
  const mediaType = (allowedMimes.includes(mime as AllowedMime) ? mime : 'image/jpeg') as AllowedMime

  const response = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system:     systemPrompt,
    messages: [
      {
        role:    'user',
        content: [
          {
            type:   'image',
            source: { type: 'base64', media_type: mediaType, data: imgBase64 },
          },
          {
            type: 'text',
            text: `Genera un caption ${tone} para esta imagen de wax melt de Velunisa.${productContext}`,
          },
        ],
      },
    ],
  })

  const caption = response.content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()

  return NextResponse.json({ data: { caption } })
}
