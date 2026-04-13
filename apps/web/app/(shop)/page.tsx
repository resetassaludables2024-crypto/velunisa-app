import { Suspense } from 'react'
import { HeroSlider }       from '@/components/home/HeroSlider'
import { CategoryGrid }     from '@/components/home/CategoryGrid'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { NewArrivals }      from '@/components/home/NewArrivals'
import { WhatsAppCTA }      from '@/components/home/WhatsAppCTA'
import { ProductGrid }      from '@/components/product/ProductGrid'

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 laptop:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden">
          <div className="shimmer aspect-square" />
          <div className="p-4 space-y-2">
            <div className="shimmer h-4 rounded w-3/4" />
            <div className="shimmer h-3 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <CategoryGrid />

      <Suspense fallback={
        <section className="py-16 bg-brand-bg">
          <div className="container-velunisa"><ProductSkeleton /></div>
        </section>
      }>
        <FeaturedProducts />
      </Suspense>

      {/* Trust Section */}
      <section className="py-12 bg-brand-charcoal text-brand-cream">
        <div className="container-velunisa">
          <div className="grid grid-cols-2 laptop:grid-cols-4 gap-8 text-center">
            {[
              { icon: '🌿', title: '100% Natural',     desc: 'Cera de soya + aceites esenciales' },
              { icon: '🎨', title: 'Diseño artesanal', desc: 'Cada pieza hecha a mano con amor' },
              { icon: '🚚', title: 'Envío nacional',   desc: 'A todo Ecuador en 2-5 días' },
              { icon: '💛', title: 'Con garantía',     desc: 'Satisfacción garantizada' },
            ].map(item => (
              <div key={item.title} className="space-y-2">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="font-serif text-sm font-semibold text-brand-cream">{item.title}</h3>
                <p className="text-xs text-brand-tan">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={
        <section className="py-16 bg-white">
          <div className="container-velunisa"><ProductSkeleton /></div>
        </section>
      }>
        <NewArrivals />
      </Suspense>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-brand-cream to-brand-tan">
        <div className="container-velunisa text-center">
          <h2 className="font-serif text-3xl laptop:text-4xl text-brand-charcoal mb-4">
            ¿Buscas un regalo especial? 🎁
          </h2>
          <p className="text-brand-charcoal/70 max-w-xl mx-auto mb-8">
            Nuestros wax melts artesanales son el regalo perfecto para cualquier ocasión. Escríbenos y te ayudamos a elegir el diseño ideal.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Busco un regalo especial con wax melts 🌸')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dark"
          >
            💬 Asesoría personalizada
          </a>
        </div>
      </section>

      <WhatsAppCTA />
    </>
  )
}
