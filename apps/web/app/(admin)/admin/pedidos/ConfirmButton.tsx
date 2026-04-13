'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ConfirmButton({ orderNumber }: { orderNumber: string }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!confirm(`¿Confirmar pago del pedido ${orderNumber}?`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/confirm`, {
        method: 'POST',
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Error al confirmar')
      } else {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-pill transition-colors font-medium disabled:opacity-50"
    >
      {loading ? '...' : '✓ Confirmar pago'}
    </button>
  )
}
