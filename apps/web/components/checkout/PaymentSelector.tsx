'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Building2 } from 'lucide-react'
import { BankTransferPage }  from './BankTransferPage'
import { PaymentezCard }     from './PaymentezCard'

interface CheckoutData {
  orderNumber:     string
  total:           number
  guestEmail?:     string
  shippingAddress: Record<string, string>
}

const PAYMENTEZ_ENABLED = !!(
  process.env.NEXT_PUBLIC_PAYMENTEZ_CLIENT_APP_CODE &&
  process.env.NEXT_PUBLIC_PAYMENTEZ_CLIENT_APP_KEY
)

type Method = 'card' | 'transfer'

export function PaymentSelector({ orderNumber }: { orderNumber?: string }) {
  const [method,  setMethod]  = useState<Method>(PAYMENTEZ_ENABLED ? 'card' : 'transfer')
  const [email,   setEmail]   = useState('')
  const [total,   setTotal]   = useState(0)

  useEffect(() => {
    const stored = sessionStorage.getItem('velunisa_checkout')
    if (stored) {
      const data: CheckoutData = JSON.parse(stored)
      setTotal(data.total)
      setEmail(data.guestEmail ?? data.shippingAddress?.email ?? '')
    }
  }, [])

  const effectiveOrder = orderNumber ?? ''

  return (
    <div className="grid laptop:grid-cols-5 gap-10">
      {/* LEFT — method selector + form */}
      <div className="laptop:col-span-3 space-y-6">

        {/* Method tabs — only show if Paymentez is configured */}
        {PAYMENTEZ_ENABLED && (
          <div className="bg-white rounded-xl border border-brand-tan/20 p-2 flex gap-2">
            <MethodTab
              active={method === 'card'}
              icon={<CreditCard size={16} />}
              label="Tarjeta de crédito / débito"
              sub="Visa · Mastercard · Amex"
              onClick={() => setMethod('card')}
            />
            <MethodTab
              active={method === 'transfer'}
              icon={<Building2 size={16} />}
              label="Transferencia bancaria"
              sub="Pago manual · Confirmación en 24h"
              onClick={() => setMethod('transfer')}
            />
          </div>
        )}

        {/* Card payment */}
        {method === 'card' && PAYMENTEZ_ENABLED && (
          <div className="bg-white rounded-xl border border-brand-tan/20 p-6">
            <PaymentezCard
              orderNumber={effectiveOrder}
              total={total}
              email={email}
              onSuccess={() => {}}
            />
          </div>
        )}

        {/* Bank transfer */}
        {method === 'transfer' && (
          <BankTransferPage orderNumber={effectiveOrder} />
        )}
      </div>

      {/* RIGHT — order summary (only for card method, transfer has its own) */}
      {method === 'card' && (
        <div className="laptop:col-span-2">
          <OrderSummaryCard orderNumber={effectiveOrder} total={total} />
        </div>
      )}
    </div>
  )
}

function MethodTab({
  active, icon, label, sub, onClick,
}: {
  active: boolean; icon: React.ReactNode; label: string; sub: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center gap-3 px-4 py-3.5 rounded-lg text-left transition-all ${
        active
          ? 'bg-brand-charcoal text-white'
          : 'hover:bg-brand-bg text-brand-charcoal'
      }`}
    >
      <div className={active ? 'text-white' : 'text-brand-muted'}>{icon}</div>
      <div>
        <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-brand-charcoal'}`}>
          {label}
        </p>
        <p className={`text-xs mt-0.5 ${active ? 'text-white/60' : 'text-brand-muted'}`}>
          {sub}
        </p>
      </div>
    </button>
  )
}

function OrderSummaryCard({ orderNumber, total }: { orderNumber: string; total: number }) {
  const [items, setItems] = useState<Array<{ name: string; quantity: number; price: number }>>([])

  useEffect(() => {
    const stored = sessionStorage.getItem('velunisa_checkout')
    if (stored) {
      const data = JSON.parse(stored)
      setItems(data.items ?? [])
    }
  }, [])

  return (
    <div className="bg-white rounded-xl border border-brand-tan/20 p-6 sticky top-24">
      <h3 className="font-serif text-lg text-brand-charcoal mb-4">Resumen</h3>
      <p className="text-xs font-mono text-brand-muted mb-4">{orderNumber}</p>
      <ul className="space-y-3 text-sm mb-4">
        {items.map((item, i) => (
          <li key={i} className="flex justify-between text-brand-charcoal">
            <span className="truncate max-w-[180px]">{item.name} × {item.quantity}</span>
            <span className="font-medium ml-4">${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-brand-tan/20 pt-4 flex justify-between font-bold text-brand-charcoal">
        <span>Total a pagar</span>
        <span className="text-lg">${total.toFixed(2)}</span>
      </div>
    </div>
  )
}
