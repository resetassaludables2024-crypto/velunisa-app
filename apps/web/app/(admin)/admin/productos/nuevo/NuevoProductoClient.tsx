'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter }  from 'next/navigation'
import { Button }     from '@/components/ui/Button'
import { Input }      from '@/components/ui/Input'
import { Select }     from '@/components/ui/Select'

interface Category { id: string; name: string; slug: string }

interface FormState {
  name:              string
  slug:              string
  description:       string
  usageInstructions: string
  price:             string
  comparePrice:      string
  stock:             string
  sku:               string
  categoryId:        string
  isNew:             boolean
  isFeatured:        boolean
  images:            string[]
}

const INITIAL_FORM: FormState = {
  name: '', slug: '', description: '', usageInstructions: '',
  price: '', comparePrice: '', stock: '0', sku: '',
  categoryId: '', isNew: false, isFeatured: false, images: [],
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

export function NuevoProductoClient({ categories }: { categories: Category[] }) {
  const router = useRouter()

  // Image state
  const [imageMode,     setImageMode]     = useState<'upload' | 'url'>('upload')
  const [previewUrl,    setPreviewUrl]    = useState<string | null>(null)
  const [cloudinaryUrl, setCloudinaryUrl] = useState('')
  const [dataUri,       setDataUri]       = useState<string | null>(null)  // full data URI for Cloudinary upload
  const [mediaType,     setMediaType]     = useState('image/jpeg')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI state
  const [analyzing,    setAnalyzing]    = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [aiApplied,    setAiApplied]    = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  // Form state
  const [form,      setForm]      = useState<FormState>(INITIAL_FORM)
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Image handling ──────────────────────────────────────────────────────────

  const handleFileChange = useCallback((file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      setAnalyzeError('Formato no admitido. Usa JPG, PNG, GIF o WEBP.')
      return
    }
    setMediaType(file.type)
    setPreviewUrl(URL.createObjectURL(file))
    setAiApplied(false)
    setAnalyzeError(null)

    const reader = new FileReader()
    reader.onload = (e) => setDataUri(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(file)
  }, [handleFileChange])

  // ── AI analysis ─────────────────────────────────────────────────────────────

  async function handleAnalyze() {
    setAnalyzing(true)
    setAnalyzeError(null)

    try {
      let imageUrl: string | null = null

      if (imageMode === 'upload' && dataUri) {
        // Step 1: upload to Cloudinary to get a URL
        setUploading(true)
        const uploadRes = await fetch('/api/admin/upload', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ base64: dataUri, mediaType }),
        })
        setUploading(false)
        if (!uploadRes.ok) {
          const err = await uploadRes.json()
          throw new Error(err.error ?? 'Error al subir imagen')
        }
        const { data } = await uploadRes.json()
        imageUrl = data.url
        // Store the Cloudinary URL so it's saved with the product
        setForm(prev => ({ ...prev, images: [data.url] }))
      }

      // Step 2: analyze with Claude Vision
      const analyzeBody =
        imageMode === 'url'
          ? { sourceType: 'url', url: cloudinaryUrl }
          : { sourceType: 'url', url: imageUrl }  // use the just-uploaded URL

      const res = await fetch('/api/admin/products/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(analyzeBody),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al analizar imagen')
      }
      const { data } = await res.json()

      const matchedCategory = categories.find(c => c.slug === data.suggestedCategory)

      setForm(prev => ({
        ...prev,
        name:              data.name,
        slug:              toSlug(data.name),
        description:       data.description,
        usageInstructions: data.usageInstructions,
        categoryId:        matchedCategory?.id ?? prev.categoryId,
        images:            imageMode === 'url' ? [cloudinaryUrl] : prev.images,
      }))
      setAiApplied(true)
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setAnalyzing(false)
      setUploading(false)
    }
  }

  // ── Save product ─────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const fullDescription = form.usageInstructions
        ? `${form.description}\n\n**Modo de uso:** ${form.usageInstructions}`
        : form.description

      const res = await fetch('/api/products', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         form.name,
          slug:         form.slug,
          description:  fullDescription,
          price:        parseFloat(form.price),
          comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
          images:       form.images,
          stock:        parseInt(form.stock),
          sku:          form.sku,
          isNew:        form.isNew,
          isFeatured:   form.isFeatured,
          categoryId:   form.categoryId,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(JSON.stringify(err.error))
      }
      router.push('/admin')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const canAnalyze =
    !analyzing && !uploading &&
    (imageMode === 'url' ? cloudinaryUrl.length > 10 : dataUri !== null)

  const canSave =
    !saving &&
    form.name && form.slug && form.price && form.categoryId && form.sku &&
    form.images.length > 0

  const categoryOptions = [
    { value: '', label: '— Selecciona una categoría —' },
    ...categories.map(c => ({ value: c.id, label: c.name })),
  ]

  const analyzeLabel = uploading
    ? 'Subiendo imagen...'
    : analyzing
    ? 'Analizando con IA...'
    : 'Analizar con IA'

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl text-brand-charcoal">Nuevo producto</h1>
        <Button variant="secondary" size="sm" onClick={() => router.push('/admin')}>
          ← Volver
        </Button>
      </div>

      {/* Image + AI section */}
      <div className="bg-white rounded-xl border border-brand-tan/20 p-6 mb-6 space-y-4">
        <h2 className="font-serif text-lg text-brand-charcoal">Imagen y análisis IA ✨</h2>

        {/* Mode toggle */}
        <div className="flex gap-2">
          {(['upload', 'url'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => { setImageMode(mode); setAiApplied(false); setAnalyzeError(null) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                imageMode === mode
                  ? 'bg-brand-charcoal text-white'
                  : 'border border-brand-tan text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              {mode === 'upload' ? 'Subir foto' : 'URL de Cloudinary'}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        {imageMode === 'upload' && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-brand-tan/40 rounded-xl p-8 text-center cursor-pointer hover:border-brand-tan transition-colors"
          >
            {previewUrl ? (
              <div className="relative inline-block">
                <img src={previewUrl} alt="Vista previa" className="max-h-48 rounded-lg mx-auto" />
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setPreviewUrl(null)
                    setDataUri(null)
                    setAiApplied(false)
                    setForm(prev => ({ ...prev, images: [] }))
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-brand-muted">
                <div className="text-4xl mb-2 opacity-40">📷</div>
                <p className="text-sm">Arrastra una foto o haz clic para seleccionar</p>
                <p className="text-xs mt-1 opacity-60">JPG, PNG, WEBP — máx. 5 MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }}
            />
          </div>
        )}

        {/* URL input */}
        {imageMode === 'url' && (
          <Input
            label="URL de imagen (Cloudinary)"
            placeholder="https://res.cloudinary.com/velunisa/..."
            value={cloudinaryUrl}
            onChange={e => { setCloudinaryUrl(e.target.value); setAiApplied(false) }}
          />
        )}

        {/* Analyze button */}
        <div className="flex items-center gap-3">
          <Button
            variant="dark"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            loading={analyzing || uploading}
          >
            {analyzeLabel}
          </Button>

          {aiApplied && (
            <span className="text-sm text-green-700 font-medium">
              ✓ Descripción generada — revisa y ajusta los campos
            </span>
          )}
        </div>

        {analyzeError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{analyzeError}</p>
        )}
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
            helper="Ejemplo: wax-melt-lavanda-boda"
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

        <div>
          <label className="block text-sm font-medium text-brand-charcoal mb-1.5">Instrucciones de uso</label>
          <textarea
            rows={3}
            value={form.usageInstructions}
            onChange={e => setForm(p => ({ ...p, usageInstructions: e.target.value }))}
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

        <div className="flex gap-6">
          {([
            { key: 'isNew'      as const, label: 'Producto nuevo' },
            { key: 'isFeatured' as const, label: 'Destacado'       },
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
          <Button variant="secondary" onClick={() => router.push('/admin')} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="dark"
            onClick={handleSave}
            loading={saving}
            disabled={!canSave}
          >
            {saving ? 'Guardando...' : 'Guardar producto'}
          </Button>
        </div>
      </div>
    </div>
  )
}
