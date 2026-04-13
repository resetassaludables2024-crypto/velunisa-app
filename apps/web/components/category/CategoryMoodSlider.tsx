'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Imágenes por categoría — reemplazar con fotos propias en Cloudinary
const CATEGORY_IMAGES: Record<string, { src: string; caption: string }[]> = {
  'baby-shower': [
    { src: 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=1200&q=80', caption: 'Detalles dulces para el nuevo integrante' },
    { src: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&q=80', caption: 'Aromas delicados para momentos tiernos' },
    { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', caption: 'Diseños artesanales con amor' },
  ],
  'bodas': [
    { src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80', caption: 'Elegancia aromática para el gran día' },
    { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', caption: 'Momentos eternos que perduran en el aroma' },
    { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80', caption: 'Sofisticación en cada pieza artesanal' },
  ],
  'cumpleanos': [
    { src: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&q=80', caption: 'Celebra con fragancias festivas' },
    { src: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1200&q=80', caption: 'Diseños coloridos para cada cumpleaños' },
    { src: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80', caption: 'El regalo que todos recordarán' },
  ],
  'dias-especiales': [
    { src: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200&q=80', caption: 'Cada ocasión merece un aroma especial' },
    { src: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80', caption: 'San Valentín, Navidad, Día de la Madre...' },
    { src: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1200&q=80', caption: 'Momentos únicos hechos con amor' },
  ],
}

const DEFAULT_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', caption: 'Wax melts artesanales Velunisa' },
  { src: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&q=80', caption: 'Hechos a mano con amor en Ecuador' },
]

interface CategoryMoodSliderProps {
  categorySlug: string
  categoryName: string
}

export function CategoryMoodSlider({ categorySlug, categoryName }: CategoryMoodSliderProps) {
  const slides  = CATEGORY_IMAGES[categorySlug] ?? DEFAULT_IMAGES
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length])
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [paused, next])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(220px, 35vh, 420px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.caption}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          {/* Overlay suave */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
            <div className="container-velunisa">
              <p className="text-white/90 text-sm font-light italic">{slide.caption}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Hero text encima */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pb-10">
        <p className="text-xs font-semibold tracking-[0.25em] text-white/70 uppercase mb-2">Colección</p>
        <h1 className="font-serif text-4xl laptop:text-5xl text-white drop-shadow-lg leading-tight">
          {categoryName}
        </h1>
      </div>

      {/* Flechas */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full transition-all duration-200"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full transition-all duration-200"
            aria-label="Siguiente"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
