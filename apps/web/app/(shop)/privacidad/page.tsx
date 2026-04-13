import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Política de privacidad' }

export default function PrivacidadPage() {
  return (
    <>
      <div className="bg-gradient-to-r from-brand-cream to-brand-tan py-12">
        <div className="container-velunisa text-center">
          <h1 className="font-serif text-4xl text-brand-charcoal">Política de privacidad</h1>
          <p className="text-brand-charcoal/60 text-sm mt-2">Última actualización: abril 2026</p>
        </div>
      </div>

      <div className="container-velunisa py-12 max-w-3xl">
        <div className="bg-white rounded-2xl border border-brand-tan/20 p-8 space-y-8 text-sm text-brand-muted leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">1. Información que recopilamos</h2>
            <p>Recopilamos información que nos proporcionas directamente, como nombre, correo electrónico, dirección de envío y teléfono al registrarte o realizar un pedido. También recopilamos información de uso de la plataforma para mejorar nuestros servicios.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">2. Uso de la información</h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Procesar y gestionar tus pedidos</li>
              <li>Enviarte confirmaciones y actualizaciones de pedidos</li>
              <li>Comunicarnos contigo por WhatsApp o email</li>
              <li>Mejorar nuestra plataforma y servicios</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">3. Compartir información</h2>
            <p>No vendemos ni alquilamos tu información personal a terceros. Podemos compartir datos con empresas de transporte (Servientrega, Tramaco) únicamente para efectuar la entrega de tu pedido.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">4. Seguridad</h2>
            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información. Sin embargo, ningún sistema es 100% seguro. Te recomendamos usar contraseñas seguras y no compartirlas.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">5. Tus derechos</h2>
            <p>Tienes derecho a acceder, corregir o eliminar tu información personal. Para ejercer estos derechos, contáctanos en <a href="mailto:hola@velunisa.com" className="text-brand-charcoal underline">hola@velunisa.com</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">6. Cookies</h2>
            <p>Usamos cookies esenciales para el funcionamiento de la plataforma (sesión de usuario, carrito de compras). No usamos cookies de seguimiento publicitario de terceros.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">7. Cambios a esta política</h2>
            <p>Podemos actualizar esta política periódicamente. Te notificaremos sobre cambios significativos por email o mediante un aviso en la plataforma.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal mb-3">8. Contacto</h2>
            <p>Para consultas sobre privacidad: <a href="mailto:hola@velunisa.com" className="text-brand-charcoal underline">hola@velunisa.com</a></p>
          </section>
        </div>
      </div>
    </>
  )
}
