'use client'

import { useState }  from 'react'
import { useRouter } from 'next/navigation'
import { Button }    from '@/components/ui/Button'
import { Input }     from '@/components/ui/Input'
import { Pencil, Check, X } from 'lucide-react'

interface Category {
  id:          string
  name:        string
  slug:        string
  description: string | null
  sortOrder:   number
  _count:      { products: number }
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

interface EditState {
  name:        string
  description: string
  sortOrder:   string
}

export function CategoriasClient({ categories: initial }: { categories: Category[] }) {
  const router = useRouter()

  // Create form
  const [showForm, setShowForm] = useState(false)
  const [newName,  setNewName]  = useState('')
  const [newDesc,  setNewDesc]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // Edit state: id → EditState
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm,  setEditForm]  = useState<EditState>({ name: '', description: '', sortOrder: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError,  setEditError]  = useState<string | null>(null)

  // Delete
  const [deleting, setDeleting] = useState<string | null>(null)

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditForm({
      name:        cat.name,
      description: cat.description ?? '',
      sortOrder:   cat.sortOrder.toString(),
    })
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError(null)
  }

  async function handleSaveEdit(id: string) {
    setEditSaving(true)
    setEditError(null)
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:        editForm.name.trim(),
          description: editForm.description.trim() || undefined,
          sortOrder:   parseInt(editForm.sortOrder) || 0,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al guardar')
      }
      setEditingId(null)
      router.refresh()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/categories', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:        newName.trim(),
          slug:        toSlug(newName),
          description: newDesc.trim() || undefined,
          sortOrder:   initial.length,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(JSON.stringify(err.error))
      }
      setNewName('')
      setNewDesc('')
      setShowForm(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error)
        return
      }
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl text-brand-charcoal">Categorías</h1>
        <Button variant="dark" size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancelar' : '+ Nueva categoría'}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-brand-tan/20 p-6 mb-6 space-y-4">
          <h2 className="font-serif text-lg text-brand-charcoal">Nueva categoría</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              placeholder="Baby Shower"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <Input
              label="Slug (generado)"
              value={toSlug(newName)}
              readOnly
              className="bg-brand-bg"
            />
          </div>
          <Input
            label="Descripción (opcional)"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
          />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
          <div className="flex gap-3">
            <Button variant="dark" onClick={handleCreate} loading={saving} disabled={!newName.trim()}>
              Guardar
            </Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Categories table */}
      <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-brand-bg">
            <tr>
              {['Nombre', 'Slug', 'Descripción', 'Productos', 'Orden', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-tan/10">
            {initial.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-brand-muted text-sm">
                  No hay categorías. Crea una para empezar.
                </td>
              </tr>
            )}
            {initial.map(cat => {
              const isEditing = editingId === cat.id
              return (
                <tr key={cat.id} className={`transition-colors ${isEditing ? 'bg-brand-bg/70' : 'hover:bg-brand-bg/50'}`}>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        className="w-full px-2 py-1.5 text-sm rounded-lg border border-brand-tan focus:outline-none focus:ring-2 focus:ring-brand-tan"
                        value={editForm.name}
                        onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                      />
                    ) : (
                      <span className="text-sm font-medium text-brand-charcoal">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-brand-muted">{cat.slug}</td>
                  <td className="px-4 py-3 max-w-[200px]">
                    {isEditing ? (
                      <input
                        className="w-full px-2 py-1.5 text-sm rounded-lg border border-brand-tan focus:outline-none focus:ring-2 focus:ring-brand-tan"
                        value={editForm.description}
                        onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Descripción opcional"
                      />
                    ) : (
                      <span className="text-sm text-brand-muted truncate block">{cat.description ?? '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-brand-charcoal font-medium">
                    {cat._count.products}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-16 px-2 py-1.5 text-sm text-center rounded-lg border border-brand-tan focus:outline-none"
                        value={editForm.sortOrder}
                        onChange={e => setEditForm(p => ({ ...p, sortOrder: e.target.value }))}
                      />
                    ) : (
                      <span className="text-sm text-center block text-brand-muted">{cat.sortOrder}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          disabled={editSaving || !editForm.name.trim()}
                          className="inline-flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-pill transition-colors disabled:opacity-50"
                        >
                          <Check size={12} />
                          {editSaving ? '...' : 'Guardar'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={editSaving}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-pill border border-brand-tan text-brand-muted hover:bg-brand-bg transition-colors"
                        >
                          <X size={12} />
                          Cancelar
                        </button>
                        {editError && (
                          <span className="text-xs text-red-600">{editError}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-pill border border-brand-tan text-brand-charcoal hover:bg-brand-cream transition-colors"
                        >
                          <Pencil size={11} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deleting === cat.id || cat._count.products > 0}
                          title={cat._count.products > 0 ? 'Tiene productos asociados' : 'Eliminar'}
                          className="text-xs px-3 py-1.5 rounded-pill border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {deleting === cat.id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
