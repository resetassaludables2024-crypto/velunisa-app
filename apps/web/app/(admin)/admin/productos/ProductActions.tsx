'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  id:       string
  isActive: boolean
}

export function ProductActions({ id, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleActive() {
    setLoading(true)
    await fetch(`/api/products/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isActive: !isActive }),
    })
    router.refresh()
    setLoading(false)
  }

  async function deleteProduct() {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    setLoading(true)
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/productos/${id}/editar`}
        className="text-xs px-3 py-1.5 rounded-pill border border-brand-tan text-brand-charcoal hover:bg-brand-cream transition-colors"
      >
        Editar
      </Link>
      <button
        onClick={toggleActive}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-pill border border-brand-tan text-brand-charcoal hover:bg-brand-cream transition-colors disabled:opacity-50"
      >
        {isActive ? 'Desactivar' : 'Activar'}
      </button>
      <button
        onClick={deleteProduct}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-pill border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  )
}
