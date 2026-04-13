'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, ChevronRight } from 'lucide-react'

interface MobileMenuProps {
  categories: Array<{ name: string; href: string }>
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ categories, isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-tan/30">
          <span className="font-serif font-bold text-xl tracking-widest text-brand-charcoal uppercase">
            Velunisa
          </span>
          <button onClick={onClose} className="p-1.5 text-brand-charcoal hover:text-brand-tan transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6">
          <Link href="/" onClick={onClose} className="flex items-center justify-between px-6 py-3.5 text-brand-charcoal hover:bg-brand-cream transition-colors">
            <span className="text-sm font-medium">Inicio</span>
          </Link>

          <div className="px-6 py-2 mt-2">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-2">Categorías</p>
          </div>

          {categories.map(cat => (
            <Link
              key={cat.href}
              href={cat.href}
              onClick={onClose}
              className="flex items-center justify-between px-6 py-3.5 text-brand-charcoal hover:bg-brand-cream transition-colors"
            >
              <span className="text-sm">{cat.name}</span>
              <ChevronRight size={14} className="text-brand-muted" />
            </Link>
          ))}

          <div className="h-px bg-brand-tan/30 my-4 mx-6" />

          <Link href="/tienda" onClick={onClose} className="flex items-center justify-between px-6 py-3.5 text-brand-charcoal hover:bg-brand-cream transition-colors">
            <span className="text-sm font-medium">Ver toda la tienda</span>
            <ChevronRight size={14} className="text-brand-muted" />
          </Link>
          <Link href="/mi-cuenta" onClick={onClose} className="flex items-center justify-between px-6 py-3.5 text-brand-charcoal hover:bg-brand-cream transition-colors">
            <span className="text-sm font-medium">Mi cuenta</span>
            <ChevronRight size={14} className="text-brand-muted" />
          </Link>
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-brand-tan/30 bg-brand-bg">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-brand-charcoal"
          >
            <span className="text-lg">📱</span>
            <span>Escríbenos por WhatsApp</span>
          </a>
        </div>
      </div>
    </>
  )
}
