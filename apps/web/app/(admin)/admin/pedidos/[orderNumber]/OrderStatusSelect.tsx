'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = [
  { value: 'PENDING',    label: 'Pendiente' },
  { value: 'CONFIRMED',  label: 'Confirmado' },
  { value: 'PROCESSING', label: 'Preparando' },
  { value: 'SHIPPED',    label: 'Enviado' },
  { value: 'DELIVERED',  label: 'Entregado' },
  { value: 'CANCELLED',  label: 'Cancelado' },
]

interface Props {
  orderNumber:   string
  currentStatus: string
}

export function OrderStatusSelect({ orderNumber, currentStatus }: Props) {
  const router  = useRouter()
  const [status,       setStatus]       = useState(currentStatus)
  const [pending,      setPending]      = useState(currentStatus)   // value selected but not saved yet
  const [trackingCode, setTrackingCode] = useState('')
  const [carrier,      setCarrier]      = useState('')
  const [showTracking, setShowTracking] = useState(false)
  const [loading,      setLoading]      = useState(false)

  function handleSelect(newStatus: string) {
    setPending(newStatus)
    setShowTracking(newStatus === 'SHIPPED')
    if (newStatus !== 'SHIPPED') {
      // Save immediately for non-shipped statuses
      saveStatus(newStatus)
    }
  }

  async function saveStatus(newStatus: string, tracking?: string, carr?: string) {
    setLoading(true)
    try {
      await fetch(`/api/admin/orders/${orderNumber}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          status:       newStatus,
          trackingCode: tracking || undefined,
          carrier:      carr     || undefined,
        }),
      })
      setStatus(newStatus)
      setShowTracking(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  function handleConfirmShipped() {
    saveStatus('SHIPPED', trackingCode, carrier)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-brand-muted mb-1.5">Cambiar estado del pedido</label>
        <select
          value={showTracking ? 'SHIPPED' : status}
          onChange={e => handleSelect(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 text-sm rounded-lg border border-brand-tan bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-tan disabled:opacity-50"
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Tracking form — shown when SHIPPED is selected */}
      {showTracking && (
        <div className="bg-brand-bg rounded-lg p-4 space-y-3 border border-brand-tan/20">
          <p className="text-xs font-semibold text-brand-charcoal">Datos de envío (opcional)</p>
          <div>
            <label className="block text-xs text-brand-muted mb-1">Código de seguimiento</label>
            <input
              type="text"
              placeholder="Ej: EP123456789EC"
              value={trackingCode}
              onChange={e => setTrackingCode(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-brand-tan bg-white focus:outline-none focus:ring-2 focus:ring-brand-tan"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1">Servicio de courier</label>
            <input
              type="text"
              placeholder="Ej: Servientrega, Laar, IESS..."
              value={carrier}
              onChange={e => setCarrier(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-brand-tan bg-white focus:outline-none focus:ring-2 focus:ring-brand-tan"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmShipped}
              disabled={loading}
              className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-pill transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Guardando...' : '🚚 Marcar como enviado'}
            </button>
            <button
              onClick={() => { setShowTracking(false); setPending(status) }}
              className="text-xs px-3 py-2 rounded-pill border border-brand-tan text-brand-muted hover:bg-brand-bg transition-colors"
            >
              Cancelar
            </button>
          </div>
          <p className="text-[10px] text-brand-muted">Se enviará email + WhatsApp al cliente automáticamente.</p>
        </div>
      )}
    </div>
  )
}
