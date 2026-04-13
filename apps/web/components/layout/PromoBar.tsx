'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const PROMOS = [
  '🌸 ¡Envíos a todo Ecuador! Pide hoy y recibe en 2-5 días hábiles',
  '🎁 Pack x6 con 10% de descuento — Perfectos para regalar',
  '💛 Wax melts artesanales 100% naturales, hechos con amor',
  '🌿 Cera de soya premium + aceites esenciales auténticos',
]

export function PromoBar() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % PROMOS.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  return (
    <div className="bg-brand-charcoal text-brand-cream py-2.5 px-4 text-center text-xs font-medium relative">
      <span className="tracking-wide">{PROMOS[current]}</span>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  )
}
