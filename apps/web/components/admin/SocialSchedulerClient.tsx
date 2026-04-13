'use client'

import { useState }     from 'react'
import { useRouter }    from 'next/navigation'
import { Button }       from '@/components/ui/Button'
import { Input }        from '@/components/ui/Input'
import { Select }       from '@/components/ui/Select'
import { Sparkles, Clock, CheckCircle, XCircle, Trash2, Eye, EyeOff } from 'lucide-react'

interface Post {
  id:           string
  platform:     string
  caption:      string
  mediaUrls:    string[]
  scheduledFor: string
  status:       string
  publishedAt:  string | null
  errorLog:     string | null
  product?:     { name: string; slug: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
  SCHEDULED: { label: 'Programado', icon: <Clock size={12} />,       class: 'bg-amber-100 text-amber-800' },
  PUBLISHED: { label: 'Publicado',  icon: <CheckCircle size={12} />, class: 'bg-green-100 text-green-800' },
  FAILED:    { label: 'Error',      icon: <XCircle size={12} />,     class: 'bg-red-100 text-red-800' },
}

const PLATFORM_ICONS: Record<string, string> = {
  INSTAGRAM: '📸',
  TIKTOK:    '🎵',
  BOTH:      '📲',
}

const TONE_OPTIONS = [
  { value: 'elegante', label: '✨ Elegante' },
  { value: 'festivo',  label: '🎉 Festivo' },
  { value: 'romantico',label: '🌹 Romántico' },
  { value: 'tierno',   label: '🍼 Tierno' },
]

export function SocialSchedulerClient({ posts: initialPosts }: { posts: Post[] }) {
  const router   = useRouter()
  const [posts,     setPosts]     = useState(initialPosts)
  const [showForm,  setShowForm]  = useState(false)

  // Form state
  const [platform,  setPlatform]  = useState('INSTAGRAM')
  const [imageUrl,  setImageUrl]  = useState('')
  const [caption,   setCaption]   = useState('')
  const [tone,      setTone]      = useState('elegante')
  const [date,      setDate]      = useState('')
  const [saving,    setSaving]    = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // AI caption
  const [generating,   setGenerating]   = useState(false)
  const [aiError,      setAiError]      = useState<string | null>(null)
  const [showPreview,  setShowPreview]  = useState(false)

  // Delete
  const [deleting, setDeleting] = useState<string | null>(null)

  async function generateCaption() {
    if (!imageUrl.trim()) {
      setAiError('Agrega la URL de imagen primero')
      return
    }
    setGenerating(true)
    setAiError(null)
    try {
      const res = await fetch('/api/social/caption', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ imageUrl, platform, tone }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al generar')
      setCaption(json.data.caption)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCreate() {
    if (!caption.trim() || !date || !imageUrl.trim()) {
      setFormError('Completa imagen, caption y fecha')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const res = await fetch('/api/social/schedule', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          caption,
          mediaUrls:    [imageUrl],
          scheduledFor: new Date(date).toISOString(),
        }),
      })
      if (!res.ok) throw new Error('Error al programar')
      const json = await res.json()
      setPosts(prev => [{
        ...json.data,
        mediaUrls: Array.isArray(json.data.mediaUrls)
          ? json.data.mediaUrls
          : JSON.parse(json.data.mediaUrls ?? '[]'),
      }, ...prev])
      resetForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setShowForm(false)
    setCaption('')
    setImageUrl('')
    setDate('')
    setAiError(null)
    setFormError(null)
    setShowPreview(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Cancelar esta publicación programada?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/social/schedule/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error)
        return
      }
      setPosts(prev => prev.filter(p => p.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  // Min datetime for the picker (now)
  const minDate = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-muted">
          {posts.filter(p => p.status === 'SCHEDULED').length} publicaciones programadas
        </p>
        <Button variant="dark" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva publicación'}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-brand-tan/20 p-6 space-y-5">
          <h3 className="font-serif text-lg text-brand-charcoal">Nueva publicación</h3>

          {/* Platform + tone row */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Plataforma"
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              options={[
                { value: 'INSTAGRAM', label: '📸 Instagram' },
                { value: 'TIKTOK',    label: '🎵 TikTok' },
                { value: 'BOTH',      label: '📲 Ambas' },
              ]}
            />
            <Select
              label="Tono del caption"
              value={tone}
              onChange={e => setTone(e.target.value)}
              options={TONE_OPTIONS}
            />
          </div>

          {/* Image URL */}
          <Input
            label="URL de imagen (Cloudinary)"
            placeholder="https://res.cloudinary.com/velunisa/..."
            value={imageUrl}
            onChange={e => { setImageUrl(e.target.value); setShowPreview(false) }}
          />

          {/* AI caption generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-brand-charcoal">Caption</label>
              <div className="flex items-center gap-2">
                {imageUrl && (
                  <button
                    onClick={() => setShowPreview(v => !v)}
                    className="flex items-center gap-1 text-xs text-brand-muted hover:text-brand-charcoal transition-colors"
                  >
                    {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showPreview ? 'Ocultar preview' : 'Ver preview'}
                  </button>
                )}
                <button
                  onClick={generateCaption}
                  disabled={generating || !imageUrl.trim()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-pill bg-brand-charcoal text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  <Sparkles size={12} />
                  {generating ? 'Generando...' : 'Generar con IA ✨'}
                </button>
              </div>
            </div>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-brand-tan bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-tan resize-none"
              rows={6}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Escribe o genera el caption con IA 🌸 #velunisa #waxmelts"
              maxLength={2200}
            />
            <div className="flex items-center justify-between mt-1">
              {aiError && <p className="text-xs text-red-600">{aiError}</p>}
              <p className="text-xs text-brand-muted ml-auto">{caption.length}/2200</p>
            </div>
          </div>

          {/* Instagram-style preview */}
          {showPreview && imageUrl && (
            <div className="border border-brand-tan/20 rounded-xl overflow-hidden max-w-xs shadow-sm">
              <div className="bg-brand-charcoal px-3 py-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-cream flex items-center justify-center text-[10px] font-bold">V</div>
                <span className="text-white text-xs font-medium">velunisa_oficial</span>
              </div>
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full aspect-square object-cover"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
              <div className="p-3">
                <p className="text-xs text-brand-dark line-clamp-4 whitespace-pre-wrap">
                  {caption || 'Caption aquí...'}
                </p>
              </div>
            </div>
          )}

          {/* Schedule datetime */}
          <Input
            label="Fecha y hora de publicación"
            type="datetime-local"
            min={minDate}
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{formError}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="dark"
              onClick={handleCreate}
              loading={saving}
              disabled={!caption.trim() || !date || !imageUrl.trim()}
            >
              📅 Programar publicación
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden">
        {posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-brand-muted text-sm">No hay publicaciones programadas aún.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-xs text-brand-charcoal underline hover:text-brand-tan transition-colors"
            >
              Crear la primera →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-bg">
                <tr>
                  {['', 'Plataforma', 'Caption', 'Programado para', 'Estado', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-tan/10">
                {posts.map(post => {
                  const s        = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.SCHEDULED
                  const imgUrl   = post.mediaUrls[0]
                  const canDelete = post.status !== 'PUBLISHED'
                  return (
                    <tr key={post.id} className="hover:bg-brand-bg/50 transition-colors">
                      {/* Thumbnail */}
                      <td className="pl-4 py-3">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-brand-tan/20"
                            onError={e => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-brand-bg border border-brand-tan/20 flex items-center justify-center text-xl">
                            {PLATFORM_ICONS[post.platform] ?? '📱'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-brand-charcoal whitespace-nowrap">
                        {PLATFORM_ICONS[post.platform]} {post.platform === 'BOTH' ? 'Ambas' : post.platform}
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-muted max-w-xs">
                        <p className="truncate">{post.caption.substring(0, 70)}{post.caption.length > 70 ? '...' : ''}</p>
                        {post.errorLog && (
                          <p className="text-xs text-red-500 mt-0.5 truncate">{post.errorLog}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-muted whitespace-nowrap">
                        {new Date(post.scheduledFor).toLocaleString('es-EC', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                        {post.publishedAt && (
                          <p className="text-green-600 mt-0.5">
                            Pub: {new Date(post.publishedAt).toLocaleString('es-EC', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium ${s.class}`}>
                          {s.icon} {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={deleting === post.id}
                            className="p-1.5 text-brand-muted hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
