import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Velunisa database...')

  // Admin user
  const adminPassword = await bcrypt.hash('velunisa_admin_2026', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@velunisa.com' },
    update: {},
    create: {
      email: 'admin@velunisa.com',
      name: 'Admin Velunisa',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'baby-shower' },
      update: {},
      create: {
        name: 'Baby Shower',
        slug: 'baby-shower',
        description: 'Wax melts especiales para celebrar la llegada de un bebé. Aromas delicados y diseños tiernos.',
        image: 'https://res.cloudinary.com/velunisa/image/upload/v1/categories/baby-shower.jpg',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'bodas' },
      update: {},
      create: {
        name: 'Bodas',
        slug: 'bodas',
        description: 'Wax melts elegantes para el día más especial. Aromas románticos y diseños sofisticados.',
        image: 'https://res.cloudinary.com/velunisa/image/upload/v1/categories/bodas.jpg',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'cumpleanos' },
      update: {},
      create: {
        name: 'Cumpleaños',
        slug: 'cumpleanos',
        description: 'Celebra con aromas festivos. Diseños alegres y coloridos para cada cumpleaños.',
        image: 'https://res.cloudinary.com/velunisa/image/upload/v1/categories/cumpleanos.jpg',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'dias-especiales' },
      update: {},
      create: {
        name: 'Días Especiales',
        slug: 'dias-especiales',
        description: 'San Valentín, Navidad, Día de la Madre y más. Diseños únicos para cada ocasión.',
        image: 'https://res.cloudinary.com/velunisa/image/upload/v1/categories/dias-especiales.jpg',
        sortOrder: 4,
      },
    }),
  ])
  console.log('✅ Categories created:', categories.length)

  // Products
  const products = [
    // Baby Shower
    {
      name: 'Wax Melt Osito de Peluche',
      slug: 'wax-melt-osito-peluche',
      description: 'Adorable wax melt en forma de osito de peluche, perfecto para ambientar tu baby shower. Fragancia suave de talco de bebé con notas de vainilla.',
      price: 8.50,
      comparePrice: null,
      images: ['https://res.cloudinary.com/velunisa/image/upload/v1/products/osito-peluche-1.jpg'],
      stock: 50,
      sku: 'VEL-BS-001',
      isNew: true,
      isFeatured: true,
      categorySlug: 'baby-shower',
    },
    {
      name: 'Pack Baby Shower Rosa',
      slug: 'pack-baby-shower-rosa',
      description: 'Set de 3 wax melts temáticos de baby shower en tonos rosados. Incluye: estrellita, corazón y mariposa. Fragancia de rosas con vainilla.',
      price: 22.00,
      comparePrice: 27.00,
      images: ['https://res.cloudinary.com/velunisa/image/upload/v1/products/pack-bs-rosa-1.jpg'],
      stock: 30,
      sku: 'VEL-BS-002',
      isNew: false,
      isFeatured: true,
      categorySlug: 'baby-shower',
    },
    {
      name: 'Wax Melt Carruaje de Princesa',
      slug: 'wax-melt-carruaje-princesa',
      description: 'Elegante wax melt en forma de carruaje de cuento de hadas. Fragancia de jazmín y sándalo. Ideal para baby showers de niña.',
      price: 10.00,
      comparePrice: null,
      images: ['https://res.cloudinary.com/velunisa/image/upload/v1/products/carruaje-1.jpg'],
      stock: 40,
      sku: 'VEL-BS-003',
      isNew: true,
      isFeatured: false,
      categorySlug: 'baby-shower',
    },
    // Bodas
    {
      name: 'Wax Melt Ramo de Novia',
      slug: 'wax-melt-ramo-novia',
      description: 'Exquisito wax melt con forma de bouquet nupcial. Fragancia de peonías y rosas blancas. El regalo perfecto para bodas y compromisos.',
      price: 12.00,
      comparePrice: null,
      images: ['https://res.cloudinary.com/velunisa/image/upload/v1/products/ramo-novia-1.jpg'],
      stock: 35,
      sku: 'VEL-BD-001',
      isNew: false,
      isFeatured: true,
      categorySlug: 'bodas',
    },
    {
      name: 'Set Nupcial Clásico',
      slug: 'set-nupcial-clasico',
      description: 'Elegante set de 6 wax melts para ambientar tu boda. Incluye diseños de anillos, palomas, corazones y flores. Fragancia de champagne y rosas.',
      price: 38.00,
      comparePrice: 45.00,
      images: ['https://res.cloudinary.com/velunisa/image/upload/v1/products/set-nupcial-1.jpg'],
      stock: 20,
      sku: 'VEL-BD-002',
      isNew: false,
      isFeatured: true,
      categorySlug: 'bodas',
    },
    // Cumpleaños
    {
      name: 'Wax Melt Pastel de Cumpleaños',
      slug: 'wax-melt-pastel-cumpleanos',
      description: 'Divertido wax melt con forma de pastel de cumpleaños de 3 pisos. Fragancia de vainilla, azúcar y fresa. ¡La decoración perfecta!',
      price: 9.00,
      comparePrice: null,
      images: ['https://res.cloudinary.com/velunisa/image/upload/v1/products/pastel-cumple-1.jpg'],
      stock: 60,
      sku: 'VEL-CU-001',
      isNew: true,
      isFeatured: true,
      categorySlug: 'cumpleanos',
    },
    {
      name: 'Pack Fiesta Mix',
      slug: 'pack-fiesta-mix',
      description: 'Divertido pack de 4 wax melts temáticos de fiesta: globo, estrella, gorro y confetti. Fragancias frutales y dulces. Para cumpleaños de niños y adultos.',
      price: 28.00,
      comparePrice: 34.00,
      images: ['https://res.cloudinary.com/velunisa/image/upload/v1/products/fiesta-mix-1.jpg'],
      stock: 25,
      sku: 'VEL-CU-002',
      isNew: false,
      isFeatured: false,
      categorySlug: 'cumpleanos',
    },
    // Días Especiales
    {
      name: 'Wax Melt Corazón San Valentín',
      slug: 'wax-melt-corazon-san-valentin',
      description: 'Apasionado wax melt en forma de corazón elaborado para San Valentín. Fragancia de rosas rojas, frambuesa y almizcle. El regalo romántico ideal.',
      price: 9.50,
      comparePrice: null,
      images: ['https://res.cloudinary.com/velunisa/image/upload/v1/products/corazon-sv-1.jpg'],
      stock: 45,
      sku: 'VEL-DE-001',
      isNew: false,
      isFeatured: true,
      categorySlug: 'dias-especiales',
    },
    {
      name: 'Set Navideño Premium',
      slug: 'set-navideno-premium',
      description: 'Mágico set de 6 wax melts navideños: árbol, estrella, muñeco de nieve, campana, calcetín y regalo. Fragancias de canela, naranja y pino.',
      price: 40.00,
      comparePrice: 48.00,
      images: ['https://res.cloudinary.com/velunisa/image/upload/v1/products/set-navideno-1.jpg'],
      stock: 30,
      sku: 'VEL-DE-002',
      isNew: false,
      isFeatured: true,
      categorySlug: 'dias-especiales',
    },
    {
      name: 'Wax Melt Día de la Madre',
      slug: 'wax-melt-dia-madre',
      description: 'Especial wax melt floral para el Día de la Madre. Diseño de flor de loto con mariposa. Fragancia de lavanda y gardenias. Un regalo con amor.',
      price: 11.00,
      comparePrice: null,
      images: ['https://res.cloudinary.com/velunisa/image/upload/v1/products/dia-madre-1.jpg'],
      stock: 55,
      sku: 'VEL-DE-003',
      isNew: true,
      isFeatured: false,
      categorySlug: 'dias-especiales',
    },
  ]

  for (const product of products) {
    const category = categories.find(c => c.slug === product.categorySlug)
    if (!category) continue

    const { categorySlug, ...productData } = product

    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        price:        productData.price,
        comparePrice: productData.comparePrice,
        images:       JSON.stringify(productData.images), // SQLite: serializar array como string
        categoryId:   category.id,
      },
    })

    // Add variants for each product
    await Promise.all([
      prisma.productVariant.upsert({
        where: { sku: `${product.sku}-IND` },
        update: {},
        create: {
          productId: created.id,
          name: 'Individual',
          price: product.price,
          stock: Math.floor(product.stock * 0.5),
          sku: `${product.sku}-IND`,
        },
      }),
      prisma.productVariant.upsert({
        where: { sku: `${product.sku}-P3` },
        update: {},
        create: {
          productId: created.id,
          name: 'Pack x3',
          price: product.price * 2.7,
          stock: Math.floor(product.stock * 0.3),
          sku: `${product.sku}-P3`,
        },
      }),
      prisma.productVariant.upsert({
        where: { sku: `${product.sku}-P6` },
        update: {},
        create: {
          productId: created.id,
          name: 'Pack x6',
          price: product.price * 5.0,
          stock: Math.floor(product.stock * 0.2),
          sku: `${product.sku}-P6`,
        },
      }),
    ])
  }

  console.log('✅ Products created:', products.length, '(with variants)')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
