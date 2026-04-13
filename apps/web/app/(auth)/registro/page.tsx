'use client'

import { useState }     from 'react'
import { useRouter }    from 'next/navigation'
import Link             from 'next/link'
import { useForm }      from 'react-hook-form'
import { zodResolver }  from '@hookform/resolvers/zod'
import { z }            from 'zod'
import { Input }        from '@/components/ui/Input'
import { Button }       from '@/components/ui/Button'

const Schema = z.object({
  name:            z.string().min(2, 'Nombre requerido'),
  email:           z.string().email('Email inválido'),
  password:        z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
  phone:           z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path:    ['confirmPassword'],
})
type FormData = z.infer<typeof Schema>

export default function RegistroPage() {
  const router = useRouter()
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(Schema) })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password, phone: data.phone }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Error al registrar')
      }
      router.push('/login?registered=1')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-brand-tan/20">
        <h1 className="font-serif text-2xl text-brand-charcoal mb-1 text-center">Crear cuenta</h1>
        <p className="text-sm text-brand-muted text-center mb-7">Únete a la familia Velunisa 🌸</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nombre completo" error={errors.name?.message}            {...register('name')} />
          <Input label="Email"           type="email" error={errors.email?.message}   {...register('email')} />
          <Input label="Teléfono / WhatsApp (opcional)" type="tel" placeholder="+593 99..." {...register('phone')} />
          <Input label="Contraseña"      type="password" error={errors.password?.message}        {...register('password')} />
          <Input label="Confirmar contraseña" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

          {error && (
            <div className="bg-red-50 border border-brand-red/20 rounded-lg p-3 text-sm text-brand-red text-center">
              {error}
            </div>
          )}

          <Button type="submit" variant="dark" size="lg" className="w-full" loading={loading}>
            Crear cuenta
          </Button>
        </form>

        <p className="mt-5 text-sm text-brand-muted text-center">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-brand-charcoal font-semibold hover:text-brand-tan transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
