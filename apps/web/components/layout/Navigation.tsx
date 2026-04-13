'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface NavItem {
  name: string
  href: string
}

interface NavigationProps {
  categories: NavItem[]
}

export function Navigation({ categories }: NavigationProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="flex items-center gap-8">
      <Link
        href="/"
        className="text-sm font-medium text-brand-charcoal hover:text-brand-tan transition-colors duration-200"
      >
        Inicio
      </Link>

      {/* Tienda with dropdown */}
      <div
        className="relative"
        onMouseEnter={() => setDropdownOpen(true)}
        onMouseLeave={() => setDropdownOpen(false)}
      >
        <button className="flex items-center gap-1 text-sm font-medium text-brand-charcoal hover:text-brand-tan transition-colors duration-200">
          Tienda
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 min-w-[200px]">
            <div className="bg-brand-bg border border-brand-tan/20 rounded-lg shadow-lg overflow-hidden animate-fade-in">
              <Link
                href="/tienda"
                className="block px-5 py-3 text-sm text-brand-charcoal hover:bg-brand-cream transition-colors border-b border-brand-tan/20 font-medium"
              >
                Ver todos
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="block px-5 py-3 text-sm text-brand-charcoal hover:bg-brand-cream transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link
        href="/tienda?isNew=true"
        className="text-sm font-medium text-brand-charcoal hover:text-brand-tan transition-colors duration-200"
      >
        Novedades
      </Link>

      <Link
        href="/tienda?isFeatured=true"
        className="text-sm font-medium text-brand-charcoal hover:text-brand-tan transition-colors duration-200"
      >
        Destacados
      </Link>
    </nav>
  )
}
