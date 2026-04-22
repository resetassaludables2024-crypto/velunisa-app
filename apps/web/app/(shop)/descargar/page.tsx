'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Download, Smartphone, Globe, Apple, Package } from 'lucide-react'

export default function DescargarPage() {
  const [apkUrl, setApkUrl] = useState<string | null>(null)

  useEffect(() => {
    // Obtener URL del APK desde variable de entorno
    const url = process.env.NEXT_PUBLIC_APK_URL
    if (url) {
      setApkUrl(url)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-amber-50 to-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Velunisa Go
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Descarga nuestra app y accede a todas tus compras desde tu celular
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
                  window.dispatchEvent(new Event('beforeinstallprompt'))
                }
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Globe className="w-5 h-5" />
              Instalar PWA
            </button>
            {apkUrl && (
              <a
                href={apkUrl}
                download
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-5 h-5" />
                Descargar APK
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* PWA Option */}
          <div className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold">PWA (Recomendado)</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Instala directamente desde tu navegador. Funciona offline y se actualiza automáticamente.
            </p>

            <h3 className="font-bold text-lg mb-4">Android:</h3>
            <ol className="space-y-3 mb-6 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">1.</span>
                <span>Abre this.site en Chrome</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">2.</span>
                <span>Haz clic en el menú (⋮) arriba a la derecha</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">3.</span>
                <span>Selecciona "Instalar app"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">4.</span>
                <span>Confirma y ¡listo!</span>
              </li>
            </ol>

            <h3 className="font-bold text-lg mb-4">iPhone/iPad:</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">1.</span>
                <span>Abre en Safari</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">2.</span>
                <span>Haz clic en el botón Compartir</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">3.</span>
                <span>Selecciona "Agregar a pantalla de inicio"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">4.</span>
                <span>Elige un nombre y confirma</span>
              </li>
            </ol>
          </div>

          {/* APK Option */}
          <div className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold">APK (Android)</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Archivo instalable directo. No requiere Play Store ni navegador.
            </p>

            {apkUrl ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-700 font-semibold mb-3">
                    APK disponible para descargar
                  </p>
                  <a
                    href={apkUrl}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    Descargar APK
                  </a>
                </div>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-700">
                  El APK estará disponible próximamente. Por ahora, usa la opción PWA.
                </p>
              </div>
            )}

            <h3 className="font-bold text-lg mb-4">Pasos de instalación:</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-green-600 min-w-fit">1.</span>
                <span>Descarga el archivo APK</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600 min-w-fit">2.</span>
                <span>Abre Archivos / Descargas</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600 min-w-fit">3.</span>
                <span>Busca el archivo y toca para instalar</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600 min-w-fit">4.</span>
                <span>Confirma los permisos solicitados</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600 min-w-fit">5.</span>
                <span>¡Listo! La app está instalada</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Características</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Acceso Total</h3>
              <p className="text-sm text-gray-600">
                Manage tus compras, pedidos y cuenta desde tu celular
              </p>
            </div>
            <div className="text-center">
              <Globe className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Funciona Offline</h3>
              <p className="text-sm text-gray-600">
                La app funciona sin conexión para acceso rápido
              </p>
            </div>
            <div className="text-center">
              <Apple className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Sin Play Store</h3>
              <p className="text-sm text-gray-600">
                Instala directamente sin depender de tiendas de apps
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">¿Necesitas ayuda?</h2>
          <p className="text-gray-600 mb-6">
            Si tienes problemas instalando la app, contacta con nosotros
          </p>
          <Link
            href="/contacto"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Contactar Soporte
          </Link>
        </div>
      </div>
    </div>
  )
}
