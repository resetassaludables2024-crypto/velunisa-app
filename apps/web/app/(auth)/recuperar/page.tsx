'use client'

import { useState }  from 'react'
import Link          from 'next/link'
import { Button }    from '@/components/ui/Button'
import { Input }     from '@/components/ui/Input'
import { Mail, ChevronLeft, CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'

export default function RecuperarPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    // Simula envío — integrar con Resend cuando esté configurado
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-brand-tan/20 p-8">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-brand-cream flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-brand-charcoal" />
                </div>
                <h1 className="font-serif text-2xl text-brand-charcoal">Recuperar contraseña</h1>
                <p className="text-sm text-brand-muted mt-2">
                  Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <Button type="submit" variant="dark" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar instrucciones'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-brand-charcoal mb-2">¡Revisa tu email!</h2>
              <p className="text-sm text-brand-muted mb-6">
                Si <strong>{email}</strong> está registrado, recibirás las instrucciones en breve.
              </p>
              <p className="text-xs text-brand-muted">
                ¿No lo ves? Revisa tu carpeta de spam.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-charcoal transition-colors">
              <ChevronLeft size={14} />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
