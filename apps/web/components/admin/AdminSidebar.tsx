'use client'

import Link      from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut }     from 'next-auth/react'
import { cn }          from '@/lib/utils'
import {
  LayoutDashboard, Package, ShoppingCart, Tag,
  Share2, LogOut, Home, BarChart2,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin',               label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/pedidos',       label: 'Pedidos',      icon: ShoppingCart },
  { href: '/admin/productos',     label: 'Productos',    icon: Package },
  { href: '/admin/categorias',    label: 'Categorías',   icon: Tag },
  { href: '/admin/publicaciones', label: 'Publicaciones', icon: Share2 },
  { href: '/admin/analytics',     label: 'Analytics',    icon: BarChart2 },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden laptop:flex w-56 flex-shrink-0 flex-col bg-brand-charcoal min-h-screen">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/" className="font-serif font-bold text-lg tracking-widest text-brand-cream uppercase">
          Velunisa
        </Link>
        <p className="text-xs text-brand-tan/60 mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon     = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200',
                isActive
                  ? 'bg-brand-cream/10 text-brand-cream font-semibold'
                  : 'text-brand-tan/70 hover:text-brand-cream hover:bg-white/5'
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-tan/70 hover:text-brand-cream hover:bg-white/5 transition-colors">
          <Home size={16} />
          Ver tienda
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-tan/70 hover:text-brand-red hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
