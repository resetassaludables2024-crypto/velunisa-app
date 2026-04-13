import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Checkout' }

export default function CheckoutPage() {
  return (
    <div className="container-velunisa py-10 max-w-4xl">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {['Datos de envío', 'Pago', 'Confirmación'].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              i === 0 ? 'bg-brand-charcoal text-white' : 'bg-brand-tan/30 text-brand-muted'
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm ${i === 0 ? 'font-semibold text-brand-charcoal' : 'text-brand-muted'}`}>
              {step}
            </span>
            {i < 2 && <div className="w-8 h-px bg-brand-tan/40 mx-1" />}
          </div>
        ))}
      </div>

      <CheckoutForm />
    </div>
  )
}
