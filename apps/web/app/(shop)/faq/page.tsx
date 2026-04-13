'use client'

import { useState }  from 'react'
import Link          from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { Metadata } from 'next'

const FAQS = [
  {
    category: 'Productos',
    items: [
      {
        q: '¿Qué son los wax melts artesanales?',
        a: 'Los wax melts son ceras perfumadas sin mecha que se derriten en un quemador eléctrico o a vela para liberar su fragancia. Son más seguros que las velas tradicionales ya que no tienen llama directa sobre la cera.',
      },
      {
        q: '¿De qué están hechos los wax melts de Velunisa?',
        a: 'Usamos cera de soya 100% natural combinada con aceites esenciales y fragancias de alta calidad. Nuestras piezas son completamente artesanales, hechas a mano en Ecuador.',
      },
      {
        q: '¿Cuánto tiempo duran las fragancias?',
        a: 'Dependiendo del tamaño, una pieza puede durar entre 8 y 20 horas de aroma activo. Puedes reutilizar la cera hasta que ya no tenga fragancia.',
      },
      {
        q: '¿Necesito un quemador especial?',
        a: 'Necesitas un quemador de wax melts, disponible eléctrico o a tealight. Los eléctricos son más seguros y prácticos. Si no tienes uno, consúltanos por WhatsApp.',
      },
    ],
  },
  {
    category: 'Pedidos y pagos',
    items: [
      {
        q: '¿Cómo puedo hacer un pedido?',
        a: 'Agrega los productos al carrito, procede al checkout e ingresa tu dirección. El pago es por transferencia bancaria. Una vez confirmado el pago, preparamos y enviamos tu pedido.',
      },
      {
        q: '¿Qué formas de pago aceptan?',
        a: 'Aceptamos transferencia bancaria a Banco Pichincha o Banco Guayaquil. Una vez realizada, sube el comprobante en la plataforma o envíalo por WhatsApp.',
      },
      {
        q: '¿En cuánto tiempo confirman el pago?',
        a: 'Confirmamos los pagos en un plazo de 24 a 48 horas hábiles después de recibir el comprobante.',
      },
      {
        q: '¿Puedo cancelar o modificar mi pedido?',
        a: 'Puedes cancelar o modificar tu pedido antes de que sea confirmado el pago. Escríbenos por WhatsApp lo antes posible.',
      },
    ],
  },
  {
    category: 'Envíos',
    items: [
      {
        q: '¿Hacen envíos a todo Ecuador?',
        a: 'Sí, enviamos a todas las provincias del Ecuador continental e insular mediante Servientrega, Tramaco o la empresa de encomiendas de tu preferencia.',
      },
      {
        q: '¿Cuánto cuesta el envío?',
        a: 'El costo de envío varía según la ciudad de destino y el peso del paquete. Se calcula automáticamente al ingresar tu dirección en el checkout.',
      },
      {
        q: '¿Cuántos días tarda en llegar?',
        a: 'El tiempo de entrega es de 2 a 5 días hábiles después de confirmar el pago, dependiendo de la ciudad de destino.',
      },
    ],
  },
  {
    category: 'Personalización',
    items: [
      {
        q: '¿Hacen diseños personalizados?',
        a: 'Sí! Podemos crear wax melts con diseños, colores y fragancias personalizadas para eventos como bodas, baby showers y cumpleaños. Consúltanos con anticipación.',
      },
      {
        q: '¿Hacen pedidos al por mayor?',
        a: 'Sí, ofrecemos precios especiales para pedidos corporativos y al por mayor. Contáctanos por WhatsApp o email para cotización.',
      },
    ],
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-brand-tan/20 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
      >
        <span className={`text-sm font-medium transition-colors ${open ? 'text-brand-charcoal' : 'text-brand-dark group-hover:text-brand-charcoal'}`}>
          {q}
        </span>
        <ChevronDown size={16} className={`flex-shrink-0 text-brand-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="pb-4 text-sm text-brand-muted leading-relaxed">
          {a}
        </p>
      )}
    </div>
  )
}

export default function FaqPage() {
  return (
    <>
      <div className="bg-gradient-to-r from-brand-cream to-brand-tan py-12">
        <div className="container-velunisa text-center">
          <p className="text-xs text-brand-charcoal/50 uppercase tracking-widest mb-2">Ayuda</p>
          <h1 className="font-serif text-4xl text-brand-charcoal">Preguntas frecuentes</h1>
        </div>
      </div>

      <div className="container-velunisa py-12 max-w-3xl">
        <div className="space-y-10">
          {FAQS.map(section => (
            <div key={section.category}>
              <h2 className="font-serif text-xl text-brand-charcoal mb-4">{section.category}</h2>
              <div className="bg-white rounded-xl border border-brand-tan/20 px-6">
                {section.items.map(item => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-brand-charcoal text-brand-cream rounded-2xl p-8 text-center">
          <p className="font-serif text-xl mb-2">¿No encontraste tu respuesta?</p>
          <p className="text-brand-tan/80 text-sm mb-6">Nuestro equipo está listo para ayudarte</p>
          <Link
            href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola Velunisa! Tengo una pregunta 🌸')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-pill text-sm font-semibold hover:bg-[#1DA851] transition-colors"
          >
            Escribir por WhatsApp
          </Link>
        </div>
      </div>
    </>
  )
}
