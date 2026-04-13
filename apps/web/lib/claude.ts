import Anthropic from '@anthropic-ai/sdk'
import { prisma } from './db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const LUNA_SYSTEM_PROMPT = `Eres Luna, la asistente virtual de Velunisa, una marca premium de wax melts artesanales en Ecuador.

TU PERSONALIDAD:
- Eres cálida, elegante y apasionada por los aromas y las celebraciones
- Hablas en español, tuteas al cliente con cariño
- Usas emojis con moderación para hacer la conversación más amena
- Siempre mantienes un tono sofisticado pero cercano y accesible
- Eres experta en aromaterapia, wax melts y decoración para eventos

TU CONOCIMIENTO DE VELUNISA:
- Vendemos wax melts artesanales para: Baby Shower, Bodas, Cumpleaños y Días Especiales
- Los wax melts están elaborados con cera de soya premium y aceites esenciales naturales
- Disponibles en: Individual, Pack x3, Pack x6
- Enviamos a todo Ecuador (2-5 días hábiles)
- El pago se realiza por transferencia bancaria (Banco Pichincha o Banco Guayaquil)

TEMAS QUE MANEJAS:
1. Recomendar productos según ocasión, aroma preferido o presupuesto
2. Informar sobre el proceso de compra y pago por transferencia
3. Consultar estado de pedidos (cuando el cliente proporciona su número VEL-XXXX-XXXXX)
4. Resolver dudas sobre envíos y tiempos de entrega
5. Explicar cómo usar los wax melts correctamente
6. Escalar a atención humana vía WhatsApp cuando no puedas resolver algo

REGLAS IMPORTANTES:
- Nunca inventes precios, stock o información de productos; usa solo los datos que se te proporcionen
- Si el cliente pregunta por su pedido, pídele el número de pedido (formato: VEL-YYYY-NNNNN)
- Si no puedes resolver algo, di: "Para ayudarte mejor, te conecto con nuestro equipo en WhatsApp 📱"
- Cuando recomiendes un producto específico, incluye al final: [PRODUCTO:slug-del-producto]
- Sé concisa: respuestas de máximo 3-4 párrafos

CATÁLOGO DISPONIBLE:
{CATALOG_PLACEHOLDER}

PROCESO DE PAGO:
1. El cliente realiza su pedido en la web
2. Recibe los datos bancarios para transferencia
3. Sube el comprobante en la web o lo envía por WhatsApp
4. Confirmamos el pago en 24-48 horas
5. Procesamos y enviamos el pedido`

export async function getOrCreateSession(sessionId: string, userId?: string) {
  return prisma.chatSession.upsert({
    where:  { sessionId },
    update: {},
    create: {
      sessionId,
      userId: userId ?? null,
    },
  })
}

export async function getChatHistory(sessionId: string, limit = 20) {
  const messages = await prisma.chatMessage.findMany({
    where:   { sessionId },
    orderBy: { createdAt: 'asc' },
    take:    limit,
  })
  return messages.map(m => ({
    role:    m.role as 'user' | 'assistant',
    content: m.content,
  }))
}

export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata?: object
) {
  return prisma.chatMessage.create({
    data: { sessionId, role, content, metadata: metadata as any },
  })
}

export async function buildSystemPrompt(extraContext = ''): Promise<string> {
  const products = await prisma.product.findMany({
    where:   { isActive: true },
    include: { category: true },
    take:    20,
    orderBy: { createdAt: 'desc' },
  })

  const catalogText = products
    .map(p => `- ${p.name} (${p.category.name}): $${p.price} - ${p.description.substring(0, 100)}... [slug: ${p.slug}]`)
    .join('\n')

  return LUNA_SYSTEM_PROMPT.replace('{CATALOG_PLACEHOLDER}', catalogText || 'Catálogo cargándose...') + extraContext
}

export async function streamChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
) {
  return anthropic.messages.stream({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system:     systemPrompt,
    messages,
  })
}

// ── Product image analysis ────────────────────────────────────────────────────

export type ProductAnalysisResult = {
  name:              string
  description:       string
  usageInstructions: string
  suggestedCategory: string   // one of: baby-shower | bodas | cumpleanos | dias-especiales
  tags:              string[]
}

type ImageSource =
  | { type: 'url';    url: string }
  | { type: 'base64'; data: string; mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' }

const VISION_SYSTEM_PROMPT = `Eres un experto en marketing de productos artesanales para Velunisa,
una marca premium de wax melts artesanales en Ecuador. Analizas fotografías de productos y generas
contenido de marketing en español para la tienda en línea.

Devuelve ÚNICAMENTE un objeto JSON válido (sin markdown, sin texto extra) con esta estructura exacta:
{
  "name": "Nombre atractivo del producto (máx. 60 caracteres)",
  "description": "Descripción de 2-3 oraciones que evoque los aromas, la ocasión y el ambiente que crea este wax melt. Usa lenguaje sensorial y elegante.",
  "usageInstructions": "Instrucciones cortas de uso: cómo derretir el wax melt, temperatura recomendada, duración aproximada del aroma.",
  "suggestedCategory": "Una de estas opciones exactas: baby-shower | bodas | cumpleanos | dias-especiales",
  "tags": ["etiqueta1", "etiqueta2", "etiqueta3"]
}

Contexto de Velunisa: wax melts artesanales de cera de soya premium y aceites esenciales naturales.
Mercado objetivo: Ecuador. Usa español latinoamericano formal. Tono cálido, elegante y evocador.`

// SDK 0.24.x solo soporta fuente base64 — si viene URL, la descargamos primero
async function urlToBase64(
  url: string
): Promise<{ data: string; mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' }> {
  const res      = await fetch(url)
  const buffer   = await res.arrayBuffer()
  const mimeRaw  = res.headers.get('content-type') ?? 'image/jpeg'
  const mime     = mimeRaw.split(';')[0].trim()
  const allowed  = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
  const mediaType = (allowed.includes(mime as typeof allowed[number]) ? mime : 'image/jpeg') as typeof allowed[number]
  const data     = Buffer.from(buffer).toString('base64')
  return { data, mediaType }
}

export async function analyzeProductImage(
  source: ImageSource
): Promise<ProductAnalysisResult> {
  // Normalize: convert URL → base64 because SDK 0.24.x only supports base64 sources
  const base64Source =
    source.type === 'base64'
      ? { data: source.data, mediaType: source.mediaType }
      : await urlToBase64(source.url)

  const imageBlock = {
    type:   'image' as const,
    source: {
      type:       'base64' as const,
      media_type: base64Source.mediaType,
      data:       base64Source.data,
    },
  }

  const response = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system:     VISION_SYSTEM_PROMPT,
    messages: [
      {
        role:    'user',
        content: [
          imageBlock,
          { type: 'text', text: 'Analiza este wax melt artesanal de Velunisa y genera el JSON de descripción del producto.' },
        ],
      },
    ],
  })

  const rawText = response.content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map(b => b.text)
    .join('')

  // Defensively strip markdown code fences (haiku occasionally adds them despite instructions)
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  return JSON.parse(jsonText) as ProductAnalysisResult
}
