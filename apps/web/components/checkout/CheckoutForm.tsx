'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm }   from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }           from 'zod'
import { Input }       from '@/components/ui/Input'
import { Select }      from '@/components/ui/Select'
import { Button }      from '@/components/ui/Button'
import { useCartStore } from '@/store/cart.store'
import { formatPrice }  from '@/lib/utils'
import { ECUADOR_PROVINCES } from '@velunisa/types'
import Image from 'next/image'

const Schema = z.object({
  firstName:  z.string().min(2, 'Requerido'),
  lastName:   z.string().min(2, 'Requerido'),
  email:      z.string().email('Email inválido'),
  phone:      z.string().min(7, 'Teléfono inválido'),
  address:    z.string().min(5, 'Dirección requerida'),
  city:       z.string().min(2, 'Ciudad requerida'),
  province:   z.string().min(1, 'Provincia requerida'),
  postalCode: z.string().optional(),
  notes:      z.string().optional(),
})
type FormData = z.infer<typeof Schema>

export function CheckoutForm() {
  const router    = useRouter()
  const { items, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const total     = items.reduce((sum, i) => sum + (i.variant?.price ?? i.product.price) * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(Schema) })

  async function onSubmit(data: FormData) {
    if (items.length === 0) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity:  i.quantity,
          })),
          shippingAddress: {
            firstName:  data.firstName,
            lastName:   data.lastName,
            phone:      data.phone,
            address:    data.address,
            city:       data.city,
            province:   data.province,
            postalCode: data.postalCode,
          },
          guestEmail: data.email,
          notes:      data.notes,
        }),
      })

      if (!res.ok) throw new Error('Error al crear el pedido')

      const json = await res.json()
      const orderNumber = json.data.orderNumber

      // Store checkout state in sessionStorage for next step
      sessionStorage.setItem('velunisa_checkout', JSON.stringify({
        orderNumber,
        total,
        guestEmail: data.email,
        shippingAddress: { ...data },
        items: items.map(i => ({
          name:     i.product.name,
          quantity: i.quantity,
          price:    i.variant?.price ?? i.product.price,
          image:    i.product.images[0] ?? '',
        })),
      }))

      clearCart()
      router.push(`/checkout/pago?order=${orderNumber}`)
    } catch (err: any) {
      setError(err.message ?? 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-muted text-lg mb-4">Tu carrito está vacío</p>
        <Button variant="primary" asChild>
          <a href="/tienda">Ver productos</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid laptop:grid-cols-5 gap-10">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="laptop:col-span-3 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-tan/20">
          <h2 className="font-serif text-xl text-brand-charcoal mb-5">Información de contacto</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre"   error={errors.firstName?.message}  {...register('firstName')} />
              <Input label="Apellido" error={errors.lastName?.message}   {...register('lastName')} />
            </div>
            <Input label="Email"     type="email" error={errors.email?.message}  {...register('email')} />
            <Input label="Teléfono / WhatsApp" type="tel" error={errors.phone?.message} placeholder="+593 99..." {...register('phone')} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-tan/20">
          <h2 className="font-serif text-xl text-brand-charcoal mb-5">Dirección de envío</h2>
          <div className="space-y-4">
            <Input label="Dirección" error={errors.address?.message} placeholder="Calle, número, referencia" {...register('address')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Ciudad" error={errors.city?.message} {...register('city')} />
              <Select
                label="Provincia"
                error={errors.province?.message}
                options={[
                  { value: '', label: 'Seleccionar...' },
                  ...ECUADOR_PROVINCES.map(p => ({ value: p, label: p })),
                ]}
                {...register('province')}
              />
            </div>
            <Input label="Código postal (opcional)" {...register('postalCode')} />
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">Notas del pedido (opcional)</label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-brand-tan bg-white text-brand-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-tan resize-none"
                rows={3}
                placeholder="Instrucciones especiales, color preferido, etc."
                {...register('notes')}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-brand-red/20 rounded-lg p-4 text-sm text-brand-red">
            {error}
          </div>
        )}

        <Button type="submit" variant="dark" size="lg" className="w-full" loading={loading}>
          Continuar al pago →
        </Button>
      </form>

      {/* Order Summary */}
      <div className="laptop:col-span-2">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-tan/20 sticky top-24">
          <h2 className="font-serif text-lg text-brand-charcoal mb-5">
            Resumen ({itemCount} item{itemCount !== 1 ? 's' : ''})
          </h2>
          <ul className="space-y-4 mb-5">
            {items.map(item => {
              const price  = item.variant?.price ?? item.product.price
              const imgUrl = item.product.images[0] ?? '/images/placeholder.jpg'
              return (
                <li key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0">
                    <Image src={imgUrl} alt={item.product.name} fill className="object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-charcoal text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-charcoal line-clamp-1">{item.product.name}</p>
                    {item.variant && <p className="text-xs text-brand-muted">{item.variant.name}</p>}
                    <p className="text-sm font-semibold text-brand-charcoal">{formatPrice(price * item.quantity)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-brand-tan/20 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-brand-muted">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-muted">
              <span>Envío</span>
              <span className="text-green-600 font-medium">Gratis</span>
            </div>
            <div className="flex justify-between font-bold text-brand-charcoal border-t border-brand-tan/20 pt-3 mt-2">
              <span>Total</span>
              <span className="text-lg">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
