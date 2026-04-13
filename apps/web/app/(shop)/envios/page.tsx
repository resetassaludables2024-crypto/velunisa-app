import Link        from 'next/link'
import { Truck, Clock, MapPin, Package, CheckCircle, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Envíos y entregas',
  description: 'Información sobre costos, tiempos de envío y cobertura a todo Ecuador.',
}

export default function EnviosPage() {
  return (
    <>
      <div className="bg-gradient-to-r from-brand-cream to-brand-tan py-12">
        <div className="container-velunisa text-center">
          <p className="text-xs text-brand-charcoal/50 uppercase tracking-widest mb-2">Logística</p>
          <h1 className="font-serif text-4xl text-brand-charcoal">Envíos y entregas</h1>
          <p className="text-brand-charcoal/70 mt-3 text-sm max-w-xl mx-auto">
            Enviamos a todo Ecuador. Tu pedido llega empacado con amor para que la experiencia sea perfecta.
          </p>
        </div>
      </div>

      <div className="container-velunisa py-12 max-w-4xl">
        {/* Stats */}
        <div className="grid grid-cols-2 laptop:grid-cols-4 gap-5 mb-12">
          {[
            { icon: Truck,        label: 'Cobertura',     value: 'Todo Ecuador' },
            { icon: Clock,        label: 'Tiempo',        value: '2–5 días hábiles' },
            { icon: Package,      label: 'Embalaje',      value: 'Seguro y especial' },
            { icon: CheckCircle,  label: 'Seguimiento',   value: 'Guía de rastreo' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-brand-tan/20 p-5 text-center">
              <Icon size={24} className="text-brand-tan mx-auto mb-2" />
              <p className="text-xs text-brand-muted uppercase tracking-widest">{label}</p>
              <p className="font-semibold text-brand-charcoal text-sm mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid laptop:grid-cols-2 gap-8">
          {/* Tiempos */}
          <div className="bg-white rounded-xl border border-brand-tan/20 p-6">
            <h2 className="font-serif text-xl text-brand-charcoal mb-5">Tiempos de entrega</h2>
            <div className="space-y-3">
              {[
                { zona: 'Quito y alrededores',         dias: '1–2 días hábiles' },
                { zona: 'Guayaquil y Costa',           dias: '2–3 días hábiles' },
                { zona: 'Sierra (otras ciudades)',     dias: '3–4 días hábiles' },
                { zona: 'Oriente e Insular',           dias: '4–5 días hábiles' },
              ].map(row => (
                <div key={row.zona} className="flex items-center justify-between py-2 border-b border-brand-tan/10 last:border-0">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-brand-muted flex-shrink-0" />
                    <span className="text-sm text-brand-dark">{row.zona}</span>
                  </div>
                  <span className="text-sm font-medium text-brand-charcoal">{row.dias}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-muted mt-4">* Los tiempos son a partir de la confirmación del pago.</p>
          </div>

          {/* Costos */}
          <div className="bg-white rounded-xl border border-brand-tan/20 p-6">
            <h2 className="font-serif text-xl text-brand-charcoal mb-5">Costo de envío</h2>
            <div className="space-y-3">
              {[
                { descripcion: 'Quito metropolitano',    precio: '$3.50 – $5.00' },
                { descripcion: 'Guayaquil',              precio: '$4.50 – $6.00' },
                { descripcion: 'Otras ciudades',         precio: '$5.00 – $8.00' },
                { descripcion: 'Zonas remotas',          precio: '$8.00 – $12.00' },
              ].map(row => (
                <div key={row.descripcion} className="flex items-center justify-between py-2 border-b border-brand-tan/10 last:border-0">
                  <span className="text-sm text-brand-dark">{row.descripcion}</span>
                  <span className="text-sm font-semibold text-brand-charcoal">{row.precio}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-800 font-medium">
                🎉 Envío gratis en pedidos mayores a $50
              </p>
            </div>
          </div>

          {/* Proceso */}
          <div className="bg-white rounded-xl border border-brand-tan/20 p-6 laptop:col-span-2">
            <h2 className="font-serif text-xl text-brand-charcoal mb-5">¿Cómo funciona el envío?</h2>
            <div className="grid tablet:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Confirmas pago',    desc: 'Subes el comprobante de transferencia' },
                { step: '2', title: 'Preparamos',        desc: 'Empacamos tu pedido con cuidado en 24–48h' },
                { step: '3', title: 'Despachamos',       desc: 'Enviamos con Servientrega o Tramaco' },
                { step: '4', title: 'Recibes',           desc: 'Te llega con guía de rastreo por WhatsApp' },
              ].map(item => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-brand-charcoal text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                    {item.step}
                  </div>
                  <p className="font-semibold text-brand-charcoal text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-brand-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aviso */}
        <div className="mt-8 flex gap-3 p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Importante sobre el embalaje</p>
            <p className="text-sm text-amber-700">
              Los wax melts son frágiles. Los embalamos con papel burbuja y materiales protectores para que lleguen en perfectas condiciones. Si tu pedido llega dañado, contáctanos de inmediato.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-brand-muted text-sm mb-4">¿Tienes preguntas sobre tu envío?</p>
          <Link href="/contacto" className="btn-dark">Contáctanos</Link>
        </div>
      </div>
    </>
  )
}
