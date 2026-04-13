'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Menu, User, X } from 'lucide-react'
import { CartIcon } from '@/components/cart/CartIcon'
import { Navigation } from './Navigation'
import { MobileMenu } from './MobileMenu'

const CATEGORIES = [
  { name: 'Baby Shower',   href: '/categoria/baby-shower' },
  { name: 'Bodas',         href: '/categoria/bodas' },
  { name: 'Cumpleaños',    href: '/categoria/cumpleanos' },
  { name: 'Días Especiales', href: '/categoria/dias-especiales' },
]

export function Header() {
  const [scrolled,      setScrolled]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled ? 'bg-white shadow-sm' : 'bg-white'
        }`}
      >
        <div className="container-velunisa">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile: hamburger */}
            <button
              className="laptop:hidden p-2 -ml-2 text-brand-charcoal"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="font-serif font-bold text-2xl tracking-widest text-brand-charcoal uppercase">
                Velunisa
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden laptop:flex flex-1 justify-center">
              <Navigation categories={CATEGORIES} />
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-brand-charcoal hover:text-brand-tan transition-colors"
                  aria-label="Buscar"
                >
                  {searchOpen ? <X size={20} /> : <Search size={20} />}
                </button>
                {searchOpen && (
                  <form
                    action="/buscar"
                    className="absolute right-0 top-full mt-2 bg-white border border-brand-tan rounded-lg shadow-lg overflow-hidden flex animate-fade-in"
                    style={{ width: 280 }}
                  >
                    <input
                      autoFocus
                      type="search"
                      name="q"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar wax melts..."
                      className="flex-1 px-4 py-2.5 text-sm text-brand-dark outline-none"
                    />
                    <button type="submit" className="px-3 text-brand-charcoal hover:text-brand-tan transition-colors">
                      <Search size={16} />
                    </button>
                  </form>
                )}
              </div>

              {/* Account */}
              <Link href="/mi-cuenta" className="p-2 text-brand-charcoal hover:text-brand-tan transition-colors" aria-label="Mi cuenta">
                <User size={20} />
              </Link>

              {/* Cart */}
              <CartIcon />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-brand-tan/30" />
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        categories={CATEGORIES}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  )
}
