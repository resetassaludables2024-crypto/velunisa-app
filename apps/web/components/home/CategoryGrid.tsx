import Link from 'next/link'

const CATEGORIES = [
  {
    name:        'Baby Shower',
    slug:        'baby-shower',
    description: 'Aromas delicados para celebrar la nueva vida',
    emoji:       '🍼',
    gradient:    'from-pink-50 to-rose-100',
    hoverBg:     'hover:from-pink-100 hover:to-rose-200',
  },
  {
    name:        'Bodas',
    slug:        'bodas',
    description: 'Elegancia aromática para el día más especial',
    emoji:       '💍',
    gradient:    'from-amber-50 to-stone-100',
    hoverBg:     'hover:from-amber-100 hover:to-stone-200',
  },
  {
    name:        'Cumpleaños',
    slug:        'cumpleanos',
    description: 'Fragancias festivas para cada celebración',
    emoji:       '🎂',
    gradient:    'from-yellow-50 to-orange-100',
    hoverBg:     'hover:from-yellow-100 hover:to-orange-200',
  },
  {
    name:        'Días Especiales',
    slug:        'dias-especiales',
    description: 'San Valentín, Navidad, Día de la Madre y más',
    emoji:       '🌸',
    gradient:    'from-purple-50 to-pink-100',
    hoverBg:     'hover:from-purple-100 hover:to-pink-200',
  },
]

export function CategoryGrid() {
  return (
    <section className="py-16 laptop:py-20 bg-white">
      <div className="container-velunisa">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] text-brand-muted uppercase">
            Colecciones
          </span>
          <h2 className="font-serif text-3xl laptop:text-4xl text-brand-charcoal mt-2">
            Diseñado para cada ocasión
          </h2>
          <div className="w-16 h-0.5 bg-brand-tan mx-auto mt-4" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-5">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className={`group relative bg-gradient-to-br ${cat.gradient} ${cat.hoverBg} rounded-2xl p-8 text-center transition-all duration-400 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {cat.emoji}
              </div>
              <h3 className="font-serif text-xl text-brand-charcoal font-semibold mb-2">
                {cat.name}
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-charcoal group-hover:gap-2.5 transition-all duration-200">
                Ver colección
                <span className="text-brand-tan">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
