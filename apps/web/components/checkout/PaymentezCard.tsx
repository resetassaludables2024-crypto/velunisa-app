'use client'

import { useState, useEffect, useId } from 'react'
import Script       from 'next/script'
import { useRouter } from 'next/navigation'
import { Button }   from '@/components/ui/Button'
import { Input }    from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils'
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react'

// Tipado mínimo del SDK de Paymentez.js (inyectado via CDN)
declare global {
  interface Window {
    Payment?: {
      init: (clientAppCode: string, clientAppKey: string, env: 'stg' | 'prod') => void
      addCard: (
        user:    { id: string; email: string; phone?: string },
        card:    { number: string; holder_name: string; expiry_month: string; expiry_year: string; cvc: string },
        success: (response: { card: { token: string; bin: string; expiry_year: string; expiry_month: string; holder_name: string; type: string; number: string } }) => void,
        error:   (error: { error: { type: string; description: string } }) => void
      ) => void
    }
  }
}

const CLIENT_APP_CODE = process.env.NEXT_PUBLIC_PAYMENTEZ_CLIENT_APP_CODE ?? ''
const CLIENT_APP_KEY  = process.env.NEXT_PUBLIC_PAYMENTEZ_CLIENT_APP_KEY  ?? ''
const ENV             = (process.env.NEXT_PUBLIC_PAYMENTEZ_ENV ?? 'stg') as 'stg' | 'prod'

interface Props {
  orderNumber: string
  total:       number
  email:       string
  onSuccess:   () => void
}

function detectCardType(number: string): string {
  const n = number.replace(/\s/g, '')
  if (/^4/.test(n))          return 'Visa'
  if (/^5[1-5]/.test(n))     return 'Mastercard'
  if (/^3[47]/.test(n))      return 'American Express'
  if (/^6(?:011|5)/.test(n)) return 'Discover'
  return ''
}

function formatCardNumber(val: string): string {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

export function PaymentezCard({ orderNumber, total, email, onSuccess }: Props) {
  const router      = useRouter()
  const formId      = useId()

  const [sdkReady,  setSdkReady]  = useState(false)
  const [sdkError,  setSdkError]  = useState(false)

  const [cardNum,   setCardNum]   = useState('')
  const [holder,    setHolder]    = useState('')
  const [expiry,    setExpiry]    = useState('')
  const [cvc,       setCvc]       = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [approved,  setApproved]  = useState(false)

  const cardType = detectCardType(cardNum)

  function initSdk() {
    if (!window.Payment) { setSdkError(true); return }
    try {
      window.Payment.init(CLIENT_APP_CODE, CLIENT_APP_KEY, ENV)
      setSdkReady(true)
    } catch (e) {
      setSdkError(true)
    }
  }

  async function handlePay() {
    if (!window.Payment || !sdkReady) {
      setError('El SDK de pago no está disponible. Recarga la página.')
      return
    }

    const rawNum    = cardNum.replace(/\s/g, '')
    const [expM, expY] = expiry.split('/')

    if (rawNum.length < 13) { setError('Número de tarjeta inválido'); return }
    if (!expM || !expY || expM.length !== 2 || expY.length !== 2) { setError('Fecha de vencimiento inválida'); return }
    if (cvc.length < 3) { setError('CVC inválido'); return }
    if (!holder.trim()) { setError('Ingresa el nombre del titular'); return }

    setLoading(true)
    setError(null)

    // 1. Tokenizar tarjeta con Paymentez.js (datos de tarjeta NUNCA pasan por nuestro server)
    window.Payment.addCard(
      { id: email, email, phone: '' },
      {
        number:       rawNum,
        holder_name:  holder.trim().toUpperCase(),
        expiry_month: expM,
        expiry_year:  '20' + expY,
        cvc,
      },
      async (response) => {
        // 2. Enviar token al servidor para cobrar
        try {
          const res = await fetch(`/api/orders/${orderNumber}/pay`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ cardToken: response.card.token, email }),
          })
          const json = await res.json()

          if (!res.ok) {
            setError(json.error ?? 'Pago rechazado. Verifica los datos de tu tarjeta.')
            setLoading(false)
            return
          }

          // 3. Pago aprobado
          setApproved(true)
          setTimeout(() => {
            onSuccess()
            router.push(`/checkout/confirmacion?order=${orderNumber}`)
          }, 1500)
        } catch {
          setError('Error de conexión. Por favor intenta nuevamente.')
          setLoading(false)
        }
      },
      (err) => {
        setError(err.error?.description ?? 'No se pudo tokenizar la tarjeta. Verifica los datos.')
        setLoading(false)
      }
    )
  }

  if (approved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <p className="font-serif text-xl text-brand-charcoal">¡Pago aprobado!</p>
        <p className="text-brand-muted text-sm">Redirigiendo a la confirmación...</p>
      </div>
    )
  }

  return (
    <>
      {/* Cargar Paymentez.js desde CDN */}
      <Script
        src="https://cdn.paymentez.com/ccapi/sdk/payment_stable_1.0.1.min.js"
        strategy="afterInteractive"
        onLoad={initSdk}
        onError={() => setSdkError(true)}
      />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-brand-charcoal" />
            <span className="font-semibold text-brand-charcoal">Pago con tarjeta</span>
          </div>
          {/* Card logos */}
          <div className="flex items-center gap-2 opacity-60">
            <span className="text-xs font-bold px-2 py-0.5 border border-gray-300 rounded text-gray-500">VISA</span>
            <span className="text-xs font-bold px-2 py-0.5 border border-gray-300 rounded text-gray-500">MC</span>
            <span className="text-xs font-bold px-2 py-0.5 border border-gray-300 rounded text-gray-500">AMEX</span>
          </div>
        </div>

        {sdkError && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">SDK no disponible</p>
              <p className="text-xs text-amber-700 mt-1">
                No se pudo cargar el procesador de pagos. Verifica tu conexión o usa transferencia bancaria.
              </p>
            </div>
          </div>
        )}

        {/* Card fields */}
        <div className="space-y-4">
          {/* Card number */}
          <div>
            <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
              Número de tarjeta
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={cardNum}
                onChange={e => setCardNum(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 pr-20 rounded-xl border border-brand-tan bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-tan font-mono tracking-wider"
              />
              {cardType && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-muted">
                  {cardType}
                </span>
              )}
            </div>
          </div>

          {/* Holder name */}
          <div>
            <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
              Nombre en la tarjeta
            </label>
            <input
              type="text"
              value={holder}
              onChange={e => setHolder(e.target.value.toUpperCase())}
              placeholder="NOMBRE APELLIDO"
              className="w-full px-4 py-3 rounded-xl border border-brand-tan bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-tan uppercase"
            />
          </div>

          {/* Expiry + CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                Vencimiento
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/AA"
                maxLength={5}
                className="w-full px-4 py-3 rounded-xl border border-brand-tan bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-tan font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                CVC / CVV
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={cvc}
                onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="•••"
                maxLength={4}
                className="w-full px-4 py-3 rounded-xl border border-brand-tan bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-tan font-mono"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Pay button */}
        <Button
          variant="dark"
          className="w-full py-4 text-base"
          onClick={handlePay}
          loading={loading}
          disabled={loading || sdkError || !sdkReady}
        >
          <Lock size={16} />
          Pagar {formatPrice(total)} con tarjeta
        </Button>

        {/* Security note */}
        <p className="text-center text-xs text-brand-muted flex items-center justify-center gap-1.5">
          <Lock size={11} />
          Pago 100% seguro · Procesado por Paymentez · Los datos de tu tarjeta nunca pasan por nuestros servidores
        </p>

        {/* Test cards note (staging only) */}
        {ENV === 'stg' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-700">
            <p className="font-semibold mb-1">🧪 Modo prueba activo</p>
            <p>Visa: <code className="font-mono">4111111111111111</code> · Exp: 12/25 · CVC: 123</p>
            <p>Mastercard: <code className="font-mono">5500005555555559</code> · Exp: 12/25 · CVC: 123</p>
          </div>
        )}
      </div>
    </>
  )
}
