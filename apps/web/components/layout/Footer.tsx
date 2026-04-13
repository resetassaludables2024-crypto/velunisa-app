import Link from 'next/link'
import { Instagram } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-brand-charcoal text-brand-cream">
      <div className="container-velunisa py-16">
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="laptop:col-span-1">
            <h2 className="font-serif font-bold text-2xl tracking-widest text-brand-cream uppercase mb-3">
              Velunisa
            </h2>
            <p className="text-sm text-brand-tan leading-relaxed mb-5">
              Wax melts artesanales premium para cada momento especial. Elaborados con amor y los mejores ingredientes naturales en Ecuador.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/velunisa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-brand-tan/40 text-brand-tan hover:bg-brand-tan hover:text-brand-charcoal transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://tiktok.com/@velunisa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-brand-tan/40 text-brand-tan hover:bg-brand-tan hover:text-brand-charcoal transition-all duration-300 text-xs font-bold"
                aria-label="TikTok"
              >
                TK
              </a>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-brand-tan/40 text-brand-tan hover:bg-brand-tan hover:text-brand-charcoal transition-all duration-300 text-xs"
                aria-label="WhatsApp"
              >
                WA
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h3 className="text-sm font-semibold text-brand-cream uppercase tracking-widest mb-4">Tienda</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Todos los productos', href: '/tienda' },
                { label: 'Baby Shower',          href: '/categoria/baby-shower' },
                { label: 'Bodas',                href: '/categoria/bodas' },
                { label: 'Cumpleaños',           href: '/categoria/cumpleanos' },
                { label: 'Días Especiales',      href: '/categoria/dias-especiales' },
                { label: 'Novedades',            href: '/tienda?isNew=true' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-tan hover:text-brand-cream transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="text-sm font-semibold text-brand-cream uppercase tracking-widest mb-4">Ayuda</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Mi cuenta',          href: '/mi-cuenta' },
                { label: 'Mis pedidos',        href: '/mis-pedidos' },
                { label: 'Cómo comprar',       href: '/como-comprar' },
                { label: 'Envíos y entregas',  href: '/envios' },
                { label: 'Preguntas frecuentes', href: '/faq' },
                { label: 'Contacto',           href: '/contacto' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-tan hover:text-brand-cream transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-brand-cream uppercase tracking-widest mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm text-brand-tan">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Ecuador — Envíos a nivel nacional</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📱</span>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '')}`}
                  className="hover:text-brand-cream transition-colors"
                >
                  WhatsApp: {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span>✉️</span>
                <a href="mailto:hola@velunisa.com" className="hover:text-brand-cream transition-colors">
                  hola@velunisa.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span>🕐</span>
                <span>Lun–Vie: 9h00 – 18h00</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-velunisa py-5 flex flex-col tablet:flex-row items-center justify-between gap-3">
          <p className="text-xs text-brand-tan">
            © {year} Velunisa — Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacidad" className="text-xs text-brand-tan hover:text-brand-cream transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="text-xs text-brand-tan hover:text-brand-cream transition-colors">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
