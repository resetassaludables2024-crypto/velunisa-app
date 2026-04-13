import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Términos y condiciones' }

export default function TerminosPage() {
  return (
    <>
      <div className="bg-gradient-to-r from-brand-cream to-brand-tan py-12">
        <div className="container-velunisa text-center">
          <h1 className="font-serif text-4xl text-brand-charcoal">Términos y condiciones</h1>
          <p className="text-brand-charcoal/60 text-sm mt-2">Última actualización: abril 2026</p>
        </div>
      </div>

      <div className="container-velunisa py-12 max-w-3xl">
        <div className="bg-white rounded-2xl border border-brand-tan/20 p-8 space-y-8 text-sm text-brand-muted leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">1. Aceptación de términos</h2>
            <p>Al acceder y utilizar la plataforma de Velunisa, aceptas estos términos y condiciones. Si no estás de acuerdo, te pedimos no utilizar nuestros servicios.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">2. Productos</h2>
            <p>Todos nuestros wax melts son artesanales y elaborados en Ecuador. Las imágenes son referenciales; los colores pueden variar ligeramente según la pantalla. Nos reservamos el derecho de modificar precios y disponibilidad sin previo aviso.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">3. Proceso de compra y pago</h2>
            <p>Los pedidos se confirman únicamente una vez verificado el pago por transferencia bancaria. Velunisa se reserva el derecho de cancelar pedidos en caso de disponibilidad insuficiente, datos incorrectos o sospecha de fraude.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">4. Envíos y entregas</h2>
            <p>Los tiempos de entrega son estimados y pueden variar por factores externos (feriados, condiciones climáticas, disponibilidad del transportista). Velunisa no se responsabiliza por retrasos causados por terceros.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">5. Devoluciones y cambios</h2>
            <p>Aceptamos devoluciones o cambios dentro de los 5 días hábiles siguientes a la recepción del pedido, siempre que el producto esté en perfectas condiciones y en su empaque original. Los productos dañados en el envío deben reportarse dentro de las 24 horas de recibido.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">6. Propiedad intelectual</h2>
            <p>Todo el contenido de la plataforma (imágenes, textos, diseños, marca) es propiedad de Velunisa y está protegido por derechos de autor. No está permitida su reproducción sin autorización expresa.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">7. Limitación de responsabilidad</h2>
            <p>Velunisa no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de nuestros productos o servicios más allá del valor del pedido afectado.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">8. Ley aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República del Ecuador. Cualquier disputa se someterá a los tribunales competentes de Ecuador.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">9. Contacto</h2>
            <p>Para consultas sobre estos términos: <a href="mailto:hola@velunisa.com" className="text-brand-charcoal underline">hola@velunisa.com</a></p>
          </section>
        </div>
      </div>
    </>
  )
}
