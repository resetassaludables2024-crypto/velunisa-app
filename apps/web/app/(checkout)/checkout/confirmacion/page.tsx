'use client'

import { useEffect, useState } from 'react'
import Link   from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export default function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { order?: string }
}) {
  const [orderNumber, setOrderNumber] = useState(searchParams.order ?? '')
  const [total,       setTotal]       = useState(0)

  useEffect(() => {
    const stored = sessionStorage.getItem('velunisa_checkout')
    if (stored) {
      const data = JSON.parse(stored)
      if (!orderNumber) setOrderNumber(data.orderNumber)
      setTotal(data.total)
      sessionStorage.removeItem('velunisa_checkout')
    }
  }, [])

  return (
    <div className="container-velunisa py-16 max-w-2xl text-center">
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-brand-tan/20">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-500" />
          </div>
        </div>

        <h1 className="font-serif text-3xl text-brand-charcoal mb-2">
          ¡Pedido recibido! 🌸
        </h1>
        <p className="text-brand-muted mb-6">
          Gracias por tu compra en Velunisa
        </p>

        {orderNumber && (
          <div className="bg-brand-bg rounded-xl p-5 mb-8 inline-block">
            <p className="text-xs text-brand-muted mb-1">Número de pedido</p>
            <p className="text-2xl font-bold font-mono text-brand-charcoal">{orderNumber}</p>
            {total > 0 && (
              <p className="text-sm text-brand-charcoal/70 mt-1">Total: ${total.toFixed(2)}</p>
            )}
          </div>
        )}

        <div className="text-left bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 space-y-2">
          <p className="font-semibold text-amber-800 text-sm">¿Qué sigue?</p>
          <ol className="space-y-2 text-sm text-amber-700 list-none">
            <li>✅ Recibirás un email de confirmación</li>
            <li>📱 Te enviamos instrucciones por WhatsApp</li>
            <li>💸 Realiza la transferencia bancaria con los datos enviados</li>
            <li>📤 Sube tu comprobante o envíalo por WhatsApp</li>
            <li>🎁 Confirmamos tu pago en 24-48h y enviamos tu pedido</li>
          </ol>
        </div>

        <div className="flex flex-col tablet:flex-row gap-3 justify-center">
          <Button variant="dark" asChild>
            <Link href="/">Seguir comprando</Link>
          </Button>
          {orderNumber && (
            <Button variant="secondary" asChild>
              <Link href={`/mis-pedidos/${orderNumber}`}>Ver mi pedido</Link>
            </Button>
          )}
        </div>

        <p className="mt-6 text-xs text-brand-muted">
          ¿Dudas?{' '}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Tengo dudas sobre mi pedido ${orderNumber}`)}`}
            className="text-brand-charcoal underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>
    </div>
  )
}
