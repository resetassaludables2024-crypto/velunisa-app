import Link      from 'next/link'
import { ShoppingBag, CreditCard, Truck, CheckCircle, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '¿Cómo comprar?',
  description: 'Guía paso a paso para realizar tu pedido en Velunisa.',
}

const STEPS = [
  {
    icon:  ShoppingBag,
    num:   '01',
    title: 'Elige tus productos',
    desc:  'Explora nuestra tienda y selecciona los wax melts que más te gusten. Puedes filtrar por categoría, novedades o destacados. Cuando encuentres uno que te guste, agrégalo al carrito.',
    tip:   '¿Necesitas ayuda eligiendo? Escríbenos por WhatsApp y te asesoramos.',
  },
  {
    icon:  ShoppingBag,
    num:   '02',
    title: 'Revisa tu carrito',
    desc:  'Haz clic en el ícono del carrito para ver los productos seleccionados. Puedes ajustar cantidades, eliminar productos y ver el total antes de continuar.',
    tip:   'Revisa bien las presentaciones (Individual, Pack x3, Pack x6) antes de confirmar.',
  },
  {
    icon:  CreditCard,
    num:   '03',
    title: 'Ingresa tus datos',
    desc:  'Completa el formulario de envío con tu nombre, dirección completa, ciudad y teléfono. Puedes crear una cuenta para guardar tus datos para futuras compras.',
    tip:   'Asegúrate de que la dirección sea completa para evitar demoras en la entrega.',
  },
  {
    icon:  CreditCard,
    num:   '04',
    title: 'Realiza la transferencia',
    desc:  'El pago es por transferencia bancaria. Te mostramos los datos de cuenta en pantalla. Realiza la transferencia desde tu banco o app bancaria por el valor exacto del pedido.',
    tip:   'Guarda el comprobante de pago, lo necesitarás en el siguiente paso.',
  },
  {
    icon:  CheckCircle,
    num:   '05',
    title: 'Sube tu comprobante',
    desc:  'Una vez hecha la transferencia, sube la foto del comprobante en la plataforma o envíala por WhatsApp. Confirmamos el pago en 24–48 horas hábiles.',
    tip:   'El número de referencia en el comprobante debe coincidir con tu número de pedido.',
  },
  {
    icon:  Truck,
    num:   '06',
    title: 'Recibe tu pedido',
    desc:  'Confirmado el pago, preparamos y despachamos tu pedido. Te enviamos la guía de rastreo por WhatsApp. El tiempo de entrega es de 2 a 5 días hábiles según tu ubicación.',
    tip:   '¡Ya puedes disfrutar tus wax melts artesanales! 🕯️',
  },
]

export default function ComoComprarPage() {
  const waNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')

  return (
    <>
      <div className="bg-gradient-to-r from-brand-cream to-brand-tan py-12">
        <div className="container-velunisa text-center">
          <p className="text-xs text-brand-charcoal/50 uppercase tracking-widest mb-2">Guía de compra</p>
          <h1 className="font-serif text-4xl text-brand-charcoal">¿Cómo comprar?</h1>
          <p className="text-brand-charcoal/70 mt-3 text-sm max-w-xl mx-auto">
            Comprar en Velunisa es sencillo. Sigue estos pasos y recibe tus wax melts artesanales en la puerta de tu casa.
          </p>
        </div>
      </div>

      <div className="container-velunisa py-12 max-w-3xl">
        <div className="space-y-6">
          {STEPS.map(({ icon: Icon, num, title, desc, tip }) => (
            <div key={num} className="flex gap-6 bg-white rounded-2xl border border-brand-tan/20 p-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-brand-charcoal text-white flex items-center justify-center">
                  <span className="font-bold text-sm">{num}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg text-brand-charcoal mb-2">{title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed mb-3">{desc}</p>
                <div className="flex items-start gap-2 bg-brand-bg rounded-lg px-3 py-2">
                  <span className="text-brand-tan text-xs mt-0.5">💡</span>
                  <p className="text-xs text-brand-charcoal/70">{tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-brand-charcoal text-brand-cream rounded-2xl p-8 text-center">
          <h2 className="font-serif text-2xl mb-3">¿Listo para tu primera compra?</h2>
          <p className="text-brand-tan/80 text-sm mb-6">
            Explora nuestra tienda o escríbenos para una asesoría personalizada.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/tienda" className="bg-brand-cream text-brand-charcoal px-6 py-3 rounded-pill text-sm font-semibold hover:bg-white transition-colors">
              Ir a la tienda
            </Link>
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hola! Quiero hacer mi primera compra en Velunisa 🌸')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-6 py-3 rounded-pill text-sm font-semibold hover:bg-[#1DA851] transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle size={16} />
              Asesoría por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
