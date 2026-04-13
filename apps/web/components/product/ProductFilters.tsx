import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Category {
  id:   string
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories: Category[]
  current:    Record<string, string | undefined>
}

export function ProductFilters({ categories, current }: ProductFiltersProps) {
  function buildHref(key: string, value: string) {
    const params = new URLSearchParams()
    // Reconstruir desde current (datos del servidor, siempre actualizados)
    Object.entries(current).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, v)
    })
    if (params.get(key) === value) params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    return qs ? `/tienda?${qs}` : '/tienda'
  }

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-3">
          Categoría
        </h3>
        <ul className="space-y-1.5">
          <li>
            <Link
              href="/tienda"
              className={cn(
                'block text-sm py-1.5 px-2 rounded transition-colors duration-200',
                !current.category ? 'text-brand-charcoal font-semibold bg-brand-cream' : 'text-brand-muted hover:text-brand-charcoal hover:bg-brand-bg'
              )}
            >
              Todos
            </Link>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <Link
                href={buildHref('category', cat.slug)}
                className={cn(
                  'block text-sm py-1.5 px-2 rounded transition-colors duration-200',
                  current.category === cat.slug
                    ? 'text-brand-charcoal font-semibold bg-brand-cream'
                    : 'text-brand-muted hover:text-brand-charcoal hover:bg-brand-bg'
                )}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-3">
          Filtrar por
        </h3>
        <ul className="space-y-1.5">
          <li>
            <Link
              href={buildHref('isNew', 'true')}
              className={cn(
                'block text-sm py-1.5 px-2 rounded transition-colors duration-200',
                current.isNew ? 'text-brand-charcoal font-semibold bg-brand-cream' : 'text-brand-muted hover:text-brand-charcoal hover:bg-brand-bg'
              )}
            >
              ✨ Novedades
            </Link>
          </li>
          <li>
            <Link
              href={buildHref('isFeatured', 'true')}
              className={cn(
                'block text-sm py-1.5 px-2 rounded transition-colors duration-200',
                current.isFeatured ? 'text-brand-charcoal font-semibold bg-brand-cream' : 'text-brand-muted hover:text-brand-charcoal hover:bg-brand-bg'
              )}
            >
              ⭐ Destacados
            </Link>
          </li>
        </ul>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-3">
          Ordenar
        </h3>
        <ul className="space-y-1.5">
          {[
            { value: '',           label: 'Relevancia' },
            { value: 'newest',     label: 'Más recientes' },
            { value: 'price_asc',  label: 'Precio: menor a mayor' },
            { value: 'price_desc', label: 'Precio: mayor a menor' },
          ].map(opt => (
            <li key={opt.value || 'relevancia'}>
              <Link
                href={buildHref('sort', opt.value)}
                className={cn(
                  'block text-sm py-1.5 px-2 rounded transition-colors duration-200',
                  (current.sort ?? '') === opt.value
                    ? 'text-brand-charcoal font-semibold bg-brand-cream'
                    : 'text-brand-muted hover:text-brand-charcoal hover:bg-brand-bg'
                )}
              >
                {opt.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
