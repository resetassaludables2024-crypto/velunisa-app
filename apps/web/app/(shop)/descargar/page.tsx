'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, Smartphone, Globe, Package, CheckCircle, AlertCircle } from 'lucide-react'

const APK_URL = 'https://github.com/resetassaludables2024-crypto/velunisa-app/releases/latest/download/velunisa.apk'

export default function DescargarPage() {
  const [pwaPrompted, setPwaPrompted] = useState(false)

  function handleInstallPwa() {
    if (typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window) {
      window.dispatchEvent(new Event('beforeinstallprompt'))
    }
    setPwaPrompted(true)
  }

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="bg-brand-charcoal text-brand-cream py-16 md:py-24">
        <div className="container-velunisa text-center">
          <p className="text-brand-tan text-sm tracking-widest uppercase mb-4">
            App oficial
          </p>
          <h1 className="font-serif text-4xl md:text-5xl mb-4">
            Velunisa en tu celular
          </h1>
          <p className="text-brand-tan text-lg max-w-xl mx-auto mb-10">
            Accede al catálogo, gestiona tus pedidos y chatea con Luna
            desde tu teléfono, cuando quieras.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleInstallPwa}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-pill
                         bg-brand-tan text-brand-charcoal font-semibold hover:bg-brand-cream
                         transition-colors"
            >
              <Globe className="w-5 h-5" />
              Instalar PWA — iPhone &amp; Android
            </button>
            <a
              href={APK_URL}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-pill
                         border-2 border-brand-tan text-brand-tan font-semibold
                         hover:bg-brand-tan hover:text-brand-charcoal transition-colors"
            >
              <Download className="w-5 h-5" />
              Descargar APK — Android
            </a>
          </div>

          {pwaPrompted && (
            <p className="mt-6 text-brand-tan text-sm">
              Sigue las instrucciones en tu navegador para agregar la app.
            </p>
          )}
        </div>
      </section>

      {/* ── Tarjetas de instalación ────────────────────────────────────── */}
      <section className="container-velunisa py-16">
        <div className="grid md:grid-cols-2 gap-8">

          {/* PWA */}
          <div className="bg-white rounded-2xl border border-brand-tan/20 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center">
                <Globe className="w-6 h-6 text-brand-charcoal" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-brand-charcoal">PWA</h2>
                <span className="text-xs text-brand-muted">iOS &amp; Android — Recomendado</span>
              </div>
            </div>
            <p className="text-brand-muted text-sm mb-6">
              Sin descargar nada extra. Se instala desde el navegador y funciona
              offline con actualizaciones automáticas.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-brand-charcoal mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> Android (Chrome)
                </h3>
                <ol className="space-y-2 text-sm text-brand-muted">
                  {[
                    'Abre velunisa.com en Chrome',
                    'Toca el menú ⋮ arriba a la derecha',
                    'Selecciona "Instalar app"',
                    'Confirma y ¡listo!',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-bold text-brand-charcoal min-w-[1.2rem]">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-brand-charcoal mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> iPhone / iPad (Safari)
                </h3>
                <ol className="space-y-2 text-sm text-brand-muted">
                  {[
                    'Abre velunisa.com en Safari',
                    'Toca el botón Compartir ↑',
                    'Selecciona "Agregar a inicio"',
                    'Confirma el nombre y listo',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-bold text-brand-charcoal min-w-[1.2rem]">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <button
              onClick={handleInstallPwa}
              className="mt-8 w-full py-3 rounded-pill bg-brand-charcoal text-brand-cream
                         font-semibold hover:bg-brand-charcoal/90 transition-colors"
            >
              Instalar PWA ahora
            </button>
          </div>

          {/* APK */}
          <div className="bg-white rounded-2xl border border-brand-tan/20 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center">
                <Package className="w-6 h-6 text-brand-charcoal" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-brand-charcoal">APK</h2>
                <span className="text-xs text-brand-muted">Solo Android</span>
              </div>
            </div>
            <p className="text-brand-muted text-sm mb-6">
              Archivo instalable directo. No requiere Play Store ni Chrome.
              Ideal si prefieres instalación nativa.
            </p>

            <div className="bg-brand-bg rounded-xl p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-brand-charcoal">APK disponible</p>
                <p className="text-xs text-brand-muted mt-0.5">
                  Versión 1.0 · Android 6.0+ · arm64 &amp; arm32
                </p>
              </div>
            </div>

            <h3 className="font-semibold text-brand-charcoal mb-3">Pasos de instalación:</h3>
            <ol className="space-y-2 text-sm text-brand-muted mb-8">
              {[
                'Descarga el archivo APK con el botón de abajo',
                'Ve a Ajustes → Seguridad → Fuentes desconocidas',
                'Activa la opción para tu navegador',
                'Abre el APK descargado desde Notificaciones o Archivos',
                '¡Instala y disfruta!',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-bold text-brand-charcoal min-w-[1.2rem]">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex gap-2 text-xs text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Android mostrará una advertencia al instalar desde fuera de Play Store.
                El APK de Velunisa es seguro y verificado.
              </span>
            </div>

            <a
              href={APK_URL}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-pill
                         bg-brand-charcoal text-brand-cream font-semibold
                         hover:bg-brand-charcoal/90 transition-colors"
            >
              <Download className="w-5 h-5" />
              Descargar APK
            </a>
          </div>
        </div>
      </section>

      {/* ── Características ───────────────────────────────────────────── */}
      <section className="bg-white border-y border-brand-tan/20 py-16">
        <div className="container-velunisa">
          <h2 className="font-serif text-2xl text-brand-charcoal text-center mb-12">
            Todo lo que necesitas, en tu bolsillo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: '🛍️', title: 'Catálogo completo',      desc: 'Todos los wax melts con fotos y variantes' },
              { icon: '📦', title: 'Seguimiento de pedidos', desc: 'Estado en tiempo real de tus compras' },
              { icon: '🤖', title: 'Chat con Luna',          desc: 'Asistente IA para recomendaciones' },
              { icon: '🔔', title: 'Notificaciones push',    desc: 'Alertas de estado de tu pedido' },
            ].map(f => (
              <div key={f.title}>
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-brand-charcoal text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-brand-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Soporte ───────────────────────────────────────────────────── */}
      <section className="container-velunisa py-16 text-center">
        <h2 className="font-serif text-2xl text-brand-charcoal mb-4">
          ¿Problemas instalando?
        </h2>
        <p className="text-brand-muted mb-6 max-w-md mx-auto">
          Escríbenos por WhatsApp o usa el formulario de contacto y te ayudamos
          en minutos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/593999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-pill
                       bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
          >
            WhatsApp
          </a>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center px-6 py-3 rounded-pill
                       border-2 border-brand-charcoal text-brand-charcoal font-semibold
                       hover:bg-brand-charcoal hover:text-brand-cream transition-colors"
          >
            Formulario de contacto
          </Link>
        </div>
      </section>
    </div>
  )
}
