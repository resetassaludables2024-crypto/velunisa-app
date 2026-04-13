'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter }    from 'next/navigation'
import { Button }       from '@/components/ui/Button'
import { Input }        from '@/components/ui/Input'
import { formatPrice }  from '@/lib/utils'
import { Copy, Check, Upload, X } from 'lucide-react'

interface CheckoutData {
  orderNumber:     string
  total:           number
  shippingAddress: Record<string, string>
  items:           Array<{ name: string; quantity: number; price: number; image: string }>
}

const BANK_ACCOUNTS = [
  {
    bank:    process.env.NEXT_PUBLIC_BANK_NAME  ?? 'Banco Pichincha',
    type:    process.env.NEXT_PUBLIC_BANK_TYPE  ?? 'Corriente',
    number:  process.env.NEXT_PUBLIC_BANK_NUMBER ?? '●●●●●●●●●●',
    owner:   process.env.NEXT_PUBLIC_BANK_OWNER  ?? 'Velunisa',
  },
]

export function BankTransferPage({ orderNumber }: { orderNumber?: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [transferRef,  setTransferRef]  = useState('')
  const [proofFile,    setProofFile]    = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [copied,       setCopied]       = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('velunisa_checkout')
    if (stored) {
      setCheckoutData(JSON.parse(stored))
    }
  }, [])

  const effectiveOrderNumber = orderNumber ?? checkoutData?.orderNumber ?? ''
  const total = checkoutData?.total ?? 0

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setProofFile(file)
    const reader = new FileReader()
    reader.onload = ev => setProofPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!effectiveOrderNumber) return
    setLoading(true)
    setError('')

    try {
      let imageBase64: string | undefined
      if (proofFile) {
        const reader = new FileReader()
        imageBase64 = await new Promise<string>(resolve => {
          reader.onload = e => resolve(e.target?.result as string)
          reader.readAsDataURL(proofFile)
        })
      }

      const res = await fetch(`/api/orders/${effectiveOrderNumber}/transfer-proof`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64:     imageBase64 ?? '',
          bankTransferRef: transferRef,
        }),
      })

      if (!res.ok) throw new Error('Error al enviar comprobante')

      router.push(`/checkout/confirmacion?order=${effectiveOrderNumber}`)
    } catch (err: any) {
      setError(err.message ?? 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid laptop:grid-cols-5 gap-10">
      {/* Payment Instructions */}
      <div className="laptop:col-span-3 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-tan/20">
          <h2 className="font-serif text-xl text-brand-charcoal mb-2">
            Instrucciones de pago
          </h2>
          <p className="text-sm text-brand-muted mb-6">
            Realiza una transferencia bancaria a una de las siguientes cuentas:
          </p>

          {BANK_ACCOUNTS.map((account, i) => (
            <div key={i} className="border border-brand-tan/30 rounded-xl p-5 mb-4 bg-brand-bg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-brand-charcoal">{account.bank}</h3>
                <span className="text-xs text-brand-muted bg-white border border-brand-tan/30 px-3 py-1 rounded-pill">
                  {account.type}
                </span>
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-brand-muted">Número de cuenta</dt>
                  <dd className="flex items-center gap-2 font-mono font-medium text-brand-charcoal">
                    {account.number}
                    <button
                      onClick={() => copyToClipboard(account.number, `num-${i}`)}
                      className="text-brand-tan hover:text-brand-charcoal transition-colors"
                    >
                      {copied === `num-${i}` ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-brand-muted">Titular</dt>
                  <dd className="font-medium text-brand-charcoal">{account.owner}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-brand-tan/20 pt-2 mt-2">
                  <dt className="font-semibold text-brand-charcoal">Monto a transferir</dt>
                  <dd className="flex items-center gap-2 font-bold text-lg text-brand-charcoal">
                    {formatPrice(total)}
                    <button
                      onClick={() => copyToClipboard(total.toFixed(2), 'amount')}
                      className="text-brand-tan hover:text-brand-charcoal transition-colors"
                    >
                      {copied === 'amount' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </dd>
                </div>
              </dl>
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">⚠️ Importante</p>
            <p>Incluye tu número de pedido <strong>{effectiveOrderNumber}</strong> en el concepto de la transferencia para una confirmación más rápida.</p>
          </div>
        </div>

        {/* Upload proof */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-tan/20">
          <h2 className="font-serif text-xl text-brand-charcoal mb-5">
            Enviar comprobante
          </h2>
          <p className="text-sm text-brand-muted mb-5">
            Una vez realizada la transferencia, sube tu comprobante para agilizar la confirmación.
          </p>

          <div className="space-y-4">
            <Input
              label="Referencia / número de transacción"
              placeholder="Ej: 2026XXXXXXXXXXXX"
              value={transferRef}
              onChange={e => setTransferRef(e.target.value)}
            />

            {/* File upload */}
            <div>
              <p className="text-sm font-medium text-brand-charcoal mb-2">
                Comprobante de transferencia
              </p>
              {proofPreview ? (
                <div className="relative w-full max-w-xs">
                  <img src={proofPreview} alt="Comprobante" className="rounded-lg border border-brand-tan/20 w-full" />
                  <button
                    onClick={() => { setProofFile(null); setProofPreview(null) }}
                    className="absolute -top-2 -right-2 bg-brand-red text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-brand-tan/50 rounded-xl py-8 flex flex-col items-center gap-3 hover:bg-brand-bg transition-colors cursor-pointer"
                >
                  <Upload size={24} className="text-brand-tan" />
                  <p className="text-sm text-brand-muted">Clic para subir imagen (JPG, PNG)</p>
                  <p className="text-xs text-brand-muted/60">Máx. 5MB</p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-brand-red/20 rounded-lg p-3 text-sm text-brand-red">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="dark"
              size="lg"
              className="flex-1"
              onClick={handleSubmit}
              loading={loading}
              disabled={!transferRef && !proofFile}
            >
              Enviar comprobante ✓
            </Button>
          </div>

          <button
            onClick={() => router.push(`/checkout/confirmacion?order=${effectiveOrderNumber}`)}
            className="w-full text-center text-xs text-brand-muted hover:text-brand-charcoal transition-colors mt-3 py-2"
          >
            Enviar comprobante más tarde →
          </button>
        </div>
      </div>

      {/* Order summary */}
      <div className="laptop:col-span-2">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-tan/20 sticky top-24">
          <h2 className="font-serif text-lg text-brand-charcoal mb-1">Pedido</h2>
          <p className="text-sm font-mono text-brand-tan mb-4">{effectiveOrderNumber}</p>

          {checkoutData && (
            <>
              <ul className="space-y-3 mb-4">
                {checkoutData.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-brand-charcoal">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium text-brand-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-brand-tan/20 pt-3">
                <div className="flex justify-between font-bold text-brand-charcoal">
                  <span>Total</span>
                  <span className="text-lg">{formatPrice(total)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
