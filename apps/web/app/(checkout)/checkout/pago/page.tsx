import { PaymentSelector } from '@/components/checkout/PaymentSelector'
import type { Metadata }   from 'next'

export const metadata: Metadata = { title: 'Pago — Velunisa' }

export default function PagoPage({
  searchParams,
}: {
  searchParams: { order?: string }
}) {
  return (
    <div className="container-velunisa py-10 max-w-5xl">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {['Datos de envío', 'Pago', 'Confirmación'].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              i === 1 ? 'bg-brand-charcoal text-white' :
              i < 1   ? 'bg-brand-tan text-white'      : 'bg-brand-tan/30 text-brand-muted'
            }`}>
              {i < 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${i === 1 ? 'font-semibold text-brand-charcoal' : 'text-brand-muted'}`}>
              {step}
            </span>
            {i < 2 && <div className="w-8 h-px bg-brand-tan/40 mx-1" />}
          </div>
        ))}
      </div>

      <PaymentSelector orderNumber={searchParams.order} />
    </div>
  )
}
