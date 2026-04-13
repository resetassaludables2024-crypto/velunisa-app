import { ProductCard } from './ProductCard'

interface Product {
  id:           string
  name:         string
  slug:         string
  price:        number | string
  comparePrice: number | string | null
  images:       unknown
  isNew:        boolean
  category?:    { name: string }
}

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
}

const colClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 laptop:grid-cols-3',
  4: 'grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4',
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <span className="text-5xl mb-4 block">🕯️</span>
        <p className="text-brand-muted">No hay productos disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className={`grid ${colClasses[columns]} gap-5 laptop:gap-6`}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          price={product.price}
          comparePrice={product.comparePrice}
          images={product.images}
          isNew={product.isNew}
          categoryName={product.category?.name}
        />
      ))}
    </div>
  )
}
