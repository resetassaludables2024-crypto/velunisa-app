'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { ProductFilters } from './ProductFilters'

interface Category { id: string; name: string; slug: string }

interface MobileFiltersDrawerProps {
  categories: Category[]
  current:    Record<string, string | undefined>
}

export function MobileFiltersDrawer({ categories, current }: MobileFiltersDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="laptop:hidden flex items-center gap-2 text-sm font-medium text-brand-charcoal border border-brand-tan rounded-pill px-4 py-2 hover:bg-brand-cream transition-colors"
      >
        <SlidersHorizontal size={16} />
        Filtrar
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 laptop:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 laptop:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-brand-tan/20">
          <h2 className="font-serif text-lg text-brand-charcoal">Filtros</h2>
          <button onClick={() => setOpen(false)} className="p-1 text-brand-muted hover:text-brand-charcoal">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto h-full pb-20">
          <ProductFilters categories={categories} current={current} />
        </div>
      </div>
    </>
  )
}
