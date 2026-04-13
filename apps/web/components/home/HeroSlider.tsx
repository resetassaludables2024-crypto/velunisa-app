'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const SLIDES = [
  {
    id:          'baby-shower',
    subtitle:    'Wax Melts Artesanales',
    title:       'Baby Shower',
    description: 'Aromas delicados para celebrar la llegada del nuevo integrante. Diseños tiernos y fragancias irresistibles.',
    cta:         'Ver colección',
    href:        '/categoria/baby-shower',
    // Reemplazar con imagen propia subida a Cloudinary
    image:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    overlay:     'from-black/60 via-black/30 to-transparent',
  },
  {
    id:          'bodas',
    subtitle:    'Momentos Eternos',
    title:       'Bodas',
    description: 'Aromas románticos para el día más especial. Elegancia y sofisticación en cada cera artesanal.',
    cta:         'Ver colección',
    href:        '/categoria/bodas',
    image:       'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1400&q=80',
    overlay:     'from-black/60 via-black/30 to-transparent',
  },
  {
    id:          'cumpleanos',
    subtitle:    'Celebra con Aromas',
    title:       'Cumpleaños',
    description: 'Diseños festivos y coloridos para cada cumpleaños. Fragancias dulces y alegres que ambientan la celebración.',
    cta:         'Ver colección',
    href:        '/categoria/cumpleanos',
    image:       'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1400&q=80',
    overlay:     'from-black/60 via-black/30 to-transparent',
  },
  {
    id:          'dias-especiales',
    subtitle:    'Cada Momento Importa',
    title:       'Días Especiales',
    description: 'Navidad, San Valentín, Día de la Madre... Diseños únicos y fragancias especiales para cada ocasión del año.',
    cta:         'Explorar',
    href:        '/categoria/dias-especiales',
    image:       'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1400&q=80',
    overlay:     'from-black/60 via-black/30 to-transparent',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)

  const prev = useCallback(() =>
    setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), [])

  const next = useCallback(() =>
    setCurrent(c => (c + 1) % SLIDES.length), [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [paused, next])

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(420px, 60vh, 620px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

          <div className="relative z-10 h-full flex items-center pb-12">
            <div className="container-velunisa">
              <div className="max-w-xl">
                <span className="inline-block text-xs font-semibold tracking-[0.25em] text-white/80 uppercase mb-4">
                  {slide.subtitle}
                </span>
                <h1 className="font-serif text-4xl laptop:text-5xl desktop:text-6xl text-white leading-tight mb-4">
                  {slide.title}
                  <br />
                  <span className="text-brand-tan">Velunisa</span>
                </h1>
                <p className="text-sm laptop:text-base text-white/80 max-w-md leading-relaxed mb-8">
                  {slide.description}
                </p>
                <div className="flex items-center flex-wrap gap-4">
                  <Button variant="dark" size="lg" asChild>
                    <Link href={slide.href}>{slide.cta}</Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/tienda">Ver todo</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Flechas */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full transition-all duration-200"
        aria-label="Anterior"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full transition-all duration-200"
        aria-label="Siguiente"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Categorías quick nav */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t border-brand-tan/20">
        <div className="container-velunisa">
          <div className="flex items-center overflow-x-auto divide-x divide-brand-tan/20">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 px-6 py-3 text-xs font-semibold tracking-wide uppercase transition-colors duration-200 min-w-[130px] text-center ${
                  i === current
                    ? 'text-brand-charcoal bg-brand-cream'
                    : 'text-brand-muted hover:text-brand-charcoal hover:bg-brand-bg'
                }`}
              >
                {slide.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
