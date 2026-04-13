'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button }   from '@/components/ui/Button'
import { Input }    from '@/components/ui/Input'
import { Select }   from '@/components/ui/Select'

interface Category { id: string; name: string; slug: string }

interface ProductData {
  id:           string
  name:         string
  slug:         string
  description:  string
  price:        number
  comparePrice: number | null
  stock:        number
  sku:          string
  images:       string[]
  categoryId:   string
  isNew:        boolean
  isFeatured:   boolean
  isActive:     boolean
}

interface Props {
  product:    ProductData
  categories: Category[]
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function EditarProductoClient({ product, categories }: Props) {
  const router = useRouter()

  const [form, setForm] = useState({
    name:         product.name,
    slug:         product.slug,
    description:  product.description,
    price:        product.price.toString(),
    comparePrice: product.comparePrice?.toString() ?? '',
    stock:        product.stock.toString(),
    sku:          product.sku,
    categoryId:   product.categoryId,
    isNew:        product.isNew,
    isFeatured:   product.isFeatured,
    isActive:     product.isActive,
    images:       product.images,
  })

  const [newImageUrl, setNewImageUrl] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saveError,   setSaveError]   = useState<string | null>(null)

  function addImageUrl() {
    const url = newImageUrl.trim()
    if (!url) return
    setForm(p => ({ ...p, images: [...p.images, url] }))
    setNewImageUrl('')
  }

  function removeImage(i: number) {
    setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         form.name,
          slug:         form.slug,
          description:  form.description,
          price:        parseFloat(form.price),
          comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
          stock:        parseInt(form.stock),
          sku:          form.sku,
          categoryId:   form.categoryId,
          isNew:        form.isNew,
          isFeatured:   form.isFeatured,
          isActive:     form.isActive,
          images:       form.images,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(JSON.stringify(err.error))
      }
      router.push('/admin/productos')
      router.refresh()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const categoryOptions = [
    { value: '', label: '— Selecciona una categoría —' },
    ...categories.map(c => ({ value: c.id, label: c.name })),
  ]

  const canSave = !saving && form.name && form.slug && form.price && form.categoryId && form.sku

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl text-brand-charcoal">Editar producto</h1>
        <Button variant="secondary" size="sm" onClick={() => router.push('/admin/productos')}>
          ← Volver
        </Button>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-brand-tan/20 p-6 mb-6">
        <h2 className="font-serif text-lg text-brand-charcoal mb-4">Imágenes</h2>

        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {form.images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  alt={`Imagen ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-brand-tan/20"
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white rounded px-1">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={e => setNewImageUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl() }}}
            placeholder="https://res.cloudinary.com/velunisa/..."
            className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-brand-tan bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-tan"
          />
          <Button variant="secondary" size="sm" onClick={addImageUrl}>
            + Añadir
          </Button>
        </div>
      </div>

      {/* Product form */}
      <div className="bg-white rounded-xl border border-brand-tan/20 p-6 space-y-5">
        <h2 className="font-serif text-lg text-brand-charcoal">Datos del producto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Nombre del producto"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: toSlug(e.target.value) }))}
          />
          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-charcoal mb-1.5">Descripción</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-brand-tan bg-white text-brand-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-tan"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Precio (USD)"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
          />
          <Input
            label="Precio tachado"
            type="number"
            step="0.01"
            min="0"
            value={form.comparePrice}
            onChange={e => setForm(p => ({ ...p, comparePrice: e.target.value }))}
          />
          <Input
            label="Stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
          />
          <Input
            label="SKU"
            value={form.sku}
            onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
          />
        </div>

        <Select
          label="Categoría"
          options={categoryOptions}
          value={form.categoryId}
          onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
        />

        <div className="flex flex-wrap gap-6">
          {([
            { key: 'isNew'      as const, label: 'Producto nuevo' },
            { key: 'isFeatured' as const, label: 'Destacado'       },
            { key: 'isActive'   as const, label: 'Activo'           },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-brand-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
                className="accent-brand-charcoal"
              />
              {label}
            </label>
          ))}
        </div>

        {saveError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{saveError}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => router.push('/admin/productos')} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="dark"
            onClick={handleSave}
            loading={saving}
            disabled={!canSave}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  )
}
