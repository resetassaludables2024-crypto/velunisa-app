import { PrismaClient } from '@prisma/client'

// Campos que están almacenados como JSON string en SQLite
// pero deben ser parseados/stringificados automáticamente
const JSON_FIELDS: Record<string, string[]> = {
  product:       ['images'],
  order:         ['shippingAddress'],
  chatmessage:   ['metadata'],
  scheduledpost: ['mediaUrls'],
  webhookevent:  ['payload'],
}

// Modelos con campos enum que son String en SQLite
// No necesitan conversión — ya son string en el código

function createPrismaClient() {
const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  // Middleware: auto-stringify antes de escribir, auto-parse después de leer
  client.$use(async (params, next) => {
    const model = params.model?.toLowerCase() ?? ''
    const fields = JSON_FIELDS[model] ?? []

    // Stringify antes de create / update / upsert
    if (fields.length > 0 && params.args?.data) {
      const stringify = (data: Record<string, unknown>) => {
        for (const field of fields) {
          if (field in data && data[field] !== null && data[field] !== undefined && typeof data[field] !== 'string') {
            data[field] = JSON.stringify(data[field])
          }
        }
      }
      if (Array.isArray(params.args.data)) {
        params.args.data.forEach(stringify)
      } else {
        stringify(params.args.data as Record<string, unknown>)
      }
    }

    const result = await next(params)

    // Parse después de leer
    if (fields.length > 0 && result) {
      const parse = (item: Record<string, unknown>) => {
        if (!item || typeof item !== 'object') return item
        for (const field of fields) {
          if (field in item && typeof item[field] === 'string') {
            try {
              item[field] = JSON.parse(item[field] as string)
            } catch {
              // si no es JSON válido, se deja como string
            }
          }
        }
        return item
      }
      if (Array.isArray(result)) {
        result.forEach(parse)
      } else {
        parse(result as Record<string, unknown>)
      }
    }

    return result
  })

  return client
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
