'use client'

import { useState }    from 'react'
import { Button }      from '@/components/ui/Button'
import { Input }       from '@/components/ui/Input'
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle } from 'lucide-react'

export default function ContactoPage() {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' })
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const phone   = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+593999999999'
  const waClean = phone.replace(/\D/g, '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-r from-brand-cream to-brand-tan py-12">
        <div className="container-velunisa text-center">
          <p className="text-xs text-brand-charcoal/50 uppercase tracking-widest mb-2">Estamos aquí para ti</p>
          <h1 className="font-serif text-4xl text-brand-charcoal">Contáctanos</h1>
        </div>
      </div>

      <div className="container-velunisa py-12">
        <div className="grid laptop:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl text-brand-charcoal mb-6">¿Cómo podemos ayudarte?</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                Estamos disponibles para ayudarte con pedidos, diseños personalizados, envíos y cualquier consulta. La forma más rápida de comunicarse es por WhatsApp.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href={`https://wa.me/${waClean}?text=${encodeURIComponent('Hola Velunisa! Tengo una consulta 🌸')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl hover:bg-[#25D366]/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-brand-charcoal text-sm">WhatsApp</p>
                  <p className="text-xs text-brand-muted">{phone} · Respuesta inmediata</p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 bg-brand-bg border border-brand-tan/20 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-brand-charcoal" />
                </div>
                <div>
                  <p className="font-semibold text-brand-charcoal text-sm">Email</p>
                  <a href="mailto:hola@velunisa.com" className="text-xs text-brand-muted hover:text-brand-charcoal transition-colors">
                    hola@velunisa.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-brand-bg border border-brand-tan/20 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-brand-charcoal" />
                </div>
                <div>
                  <p className="font-semibold text-brand-charcoal text-sm">Ubicación</p>
                  <p className="text-xs text-brand-muted">Ecuador · Envíos a nivel nacional</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-charcoal text-brand-cream rounded-xl p-5 text-sm">
              <p className="font-semibold mb-2">Horario de atención</p>
              <p className="text-brand-tan/80">Lunes – Viernes: 9:00 – 18:00</p>
              <p className="text-brand-tan/80">Sábados: 9:00 – 14:00</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-brand-tan/20 p-8">
            {!sent ? (
              <>
                <h2 className="font-serif text-xl text-brand-charcoal mb-6">Envíanos un mensaje</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input placeholder="Tu nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  <Input type="email" placeholder="Tu email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  <Input placeholder="Asunto" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
                  <textarea
                    placeholder="¿En qué podemos ayudarte?"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                    rows={5}
                    className="w-full px-4 py-3 text-sm border border-brand-tan/40 rounded-xl focus:outline-none focus:border-brand-charcoal transition-colors resize-none text-brand-dark placeholder:text-brand-muted/60"
                  />
                  <Button type="submit" variant="dark" className="w-full" disabled={loading}>
                    <Send size={14} />
                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <CheckCircle size={48} className="text-green-500 mb-4" />
                <h3 className="font-serif text-xl text-brand-charcoal mb-2">¡Mensaje enviado!</h3>
                <p className="text-sm text-brand-muted">Te responderemos pronto. También puedes escribirnos por WhatsApp para una respuesta más rápida.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
