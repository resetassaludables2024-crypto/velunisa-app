'use client'

import { MessageCircle } from 'lucide-react'

export function WhatsAppCTA() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? ''
  const message = encodeURIComponent('Hola Velunisa! Me interesa conocer más sobre sus wax melts 🌸')

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-[#25D366] text-white rounded-pill px-4 py-3 shadow-lg hover:shadow-xl hover:bg-[#1DA851] transition-all duration-300 group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={22} className="flex-shrink-0" />
      <span className="text-sm font-semibold overflow-hidden max-w-0 group-hover:max-w-[120px] transition-all duration-300 whitespace-nowrap">
        WhatsApp
      </span>
    </a>
  )
}
