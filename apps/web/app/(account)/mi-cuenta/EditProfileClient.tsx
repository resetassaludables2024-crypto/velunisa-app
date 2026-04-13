'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input }   from '@/components/ui/Input'
import { Button }  from '@/components/ui/Button'

interface Props {
  initialName:  string
  initialPhone: string
}

export function EditProfileClient({ initialName, initialPhone }: Props) {
  const router = useRouter()

  // Profile form
  const [profileOpen, setProfileOpen] = useState(false)
  const [name,        setName]        = useState(initialName)
  const [phone,       setPhone]       = useState(initialPhone)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg,    setProfileMsg]    = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Password form
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPwd,   setCurrentPwd]   = useState('')
  const [newPwd,       setNewPwd]       = useState('')
  const [confirmPwd,   setConfirmPwd]   = useState('')
  const [pwdSaving,    setPwdSaving]    = useState(false)
  const [pwdMsg,       setPwdMsg]       = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function saveProfile() {
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      const res = await fetch('/api/user/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, phone }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(Object.values(err.error ?? {}).flat().join(', ') || 'Error al guardar')
      }
      setProfileMsg({ type: 'ok', text: 'Perfil actualizado correctamente' })
      setProfileOpen(false)
      router.refresh()
    } catch (err) {
      setProfileMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setProfileSaving(false)
    }
  }

  async function savePassword() {
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'err', text: 'Las contraseñas no coinciden' })
      return
    }
    setPwdSaving(true)
    setPwdMsg(null)
    try {
      const res = await fetch('/api/user/password', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al cambiar contraseña')
      setPwdMsg({ type: 'ok', text: 'Contraseña cambiada exitosamente' })
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
      setPasswordOpen(false)
    } catch (err) {
      setPwdMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Edit profile */}
      <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden">
        <button
          onClick={() => { setProfileOpen(v => !v); setProfileMsg(null) }}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-brand-bg/50 transition-colors"
        >
          <span className="font-serif text-base text-brand-charcoal">Editar perfil</span>
          <span className="text-brand-tan text-sm">{profileOpen ? '−' : '+'}</span>
        </button>

        {profileOpen && (
          <div className="px-6 pb-6 space-y-4 border-t border-brand-tan/10">
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <Input
                label="Teléfono / WhatsApp"
                type="tel"
                placeholder="+593 99..."
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            {profileMsg && (
              <p className={`text-sm rounded-lg px-4 py-2 ${
                profileMsg.type === 'ok'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}>
                {profileMsg.text}
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="dark" size="sm" onClick={saveProfile} loading={profileSaving} disabled={!name.trim()}>
                Guardar cambios
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setProfileOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-brand-tan/20 overflow-hidden">
        <button
          onClick={() => { setPasswordOpen(v => !v); setPwdMsg(null) }}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-brand-bg/50 transition-colors"
        >
          <span className="font-serif text-base text-brand-charcoal">Cambiar contraseña</span>
          <span className="text-brand-tan text-sm">{passwordOpen ? '−' : '+'}</span>
        </button>

        {passwordOpen && (
          <div className="px-6 pb-6 space-y-4 border-t border-brand-tan/10">
            <div className="pt-4 space-y-4">
              <Input
                label="Contraseña actual"
                type="password"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nueva contraseña"
                  type="password"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                />
                <Input
                  label="Confirmar nueva contraseña"
                  type="password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                />
              </div>
            </div>
            {pwdMsg && (
              <p className={`text-sm rounded-lg px-4 py-2 ${
                pwdMsg.type === 'ok'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}>
                {pwdMsg.text}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="dark"
                size="sm"
                onClick={savePassword}
                loading={pwdSaving}
                disabled={!currentPwd || !newPwd || !confirmPwd}
              >
                Cambiar contraseña
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPasswordOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
