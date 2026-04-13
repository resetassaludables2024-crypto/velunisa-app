'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import Link from 'next/link'

interface Message {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

function generateId(): string {
  return Math.random().toString(36).slice(2)
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('velunisa_chat_session')
  if (!id) {
    id = generateId() + generateId()
    localStorage.setItem('velunisa_chat_session', id)
  }
  return id
}

const INITIAL_MESSAGE: Message = {
  id:      'initial',
  role:    'assistant',
  content: '¡Hola! 🌸 Soy Luna, tu asistente de Velunisa. ¿En qué puedo ayudarte hoy? Puedo recomendarte wax melts por ocasión, explicarte cómo comprar o consultar tu pedido.',
}

// Parse message content: split text and [PRODUCTO:slug] markers
interface TextPart    { type: 'text';    text: string }
interface ProductPart { type: 'product'; slug: string }
type MessagePart = TextPart | ProductPart

function parseMessageParts(content: string): MessagePart[] {
  const parts: MessagePart[] = []
  // Match [PRODUCTO:slug-del-producto]
  const re = /\[PRODUCTO:([a-z0-9-]+)\]/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(content)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', text: content.slice(last, match.index) })
    }
    parts.push({ type: 'product', slug: match[1] })
    last = match.index + match[0].length
  }
  if (last < content.length) {
    parts.push({ type: 'text', text: content.slice(last) })
  }
  return parts
}

function ProductCard({ slug }: { slug: string }) {
  return (
    <Link
      href={`/tienda/${slug}`}
      className="flex items-center gap-2 mt-2 px-3 py-2 bg-brand-cream/60 border border-brand-tan/30 rounded-xl hover:bg-brand-cream transition-colors group"
    >
      <span className="text-base">🕯️</span>
      <span className="flex-1 text-xs font-medium text-brand-charcoal group-hover:text-brand-dark">
        Ver producto →
      </span>
    </Link>
  )
}

function MessageContent({ content, role }: { content: string; role: 'user' | 'assistant' }) {
  if (role === 'user') {
    return <span className="whitespace-pre-wrap">{content}</span>
  }

  const parts = parseMessageParts(content)
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return (
            <span key={i} className="whitespace-pre-wrap">{part.text}</span>
          )
        }
        return <ProductCard key={i} slug={part.slug} />
      })}
    </>
  )
}

export function ChatWidget() {
  const [isOpen,   setIsOpen]   = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionId      = useRef<string>('')
  const inputRef       = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    sessionId.current = getSessionId()
  }, [])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [messages, isOpen])

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return

    const userMsg: Message = { id: generateId(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const assistantId = generateId()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:   text,
          sessionId: sessionId.current,
        }),
      })

      if (!res.ok) throw new Error('Error')
      if (!res.body) throw new Error('No stream')

      const reader    = res.body.getReader()
      const decoder   = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                fullContent += parsed.text
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  )
                )
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Lo siento, hubo un error. Por favor intenta de nuevo.' }
            : m
        )
      )
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-28 right-6 z-40 w-80 tablet:w-96 bg-white rounded-2xl shadow-2xl border border-brand-tan/20 flex flex-col transition-all duration-300 overflow-hidden ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ maxHeight: 520 }}
      >
        {/* Header */}
        <div className="bg-brand-charcoal px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-cream flex items-center justify-center text-lg flex-shrink-0">
            🌸
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Luna</p>
            <p className="text-xs text-brand-tan">Asistente Velunisa · En línea</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-brand-tan hover:text-white transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-bg/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-brand-cream flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-1">
                  🌸
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-charcoal text-white rounded-br-sm'
                    : 'bg-white text-brand-dark border border-brand-tan/20 rounded-bl-sm'
                }`}
              >
                {msg.content ? (
                  <MessageContent content={msg.content} role={msg.role} />
                ) : (
                  <span className="flex items-center gap-1.5 text-brand-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-tan animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-tan animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-tan animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            {['Ver wax melts', 'Baby Shower', 'Cómo comprar'].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); sendMessage(q) }}
                className="flex-shrink-0 text-xs px-3 py-1.5 bg-brand-cream text-brand-charcoal rounded-pill hover:bg-brand-tan transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-brand-tan/20 bg-white">
          <div className="flex items-center gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              className="flex-1 resize-none text-sm text-brand-dark placeholder:text-brand-muted px-3 py-2.5 bg-brand-bg rounded-xl border border-brand-tan/30 focus:outline-none focus:border-brand-tan max-h-24"
              rows={1}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-brand-charcoal text-white flex items-center justify-center disabled:opacity-40 hover:bg-brand-dark transition-colors flex-shrink-0"
            >
              {loading ? <Spinner className="h-4 w-4" /> : <Send size={14} />}
            </button>
          </div>
          <p className="text-[10px] text-brand-muted/60 text-center mt-2">
            Powered by Claude AI · Velunisa 🌸
          </p>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-20 right-6 z-30 w-12 h-12 rounded-full bg-brand-charcoal text-white shadow-lg hover:shadow-xl hover:bg-brand-dark transition-all duration-300 flex items-center justify-center"
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat con Luna'}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </>
  )
}
