'use client'

import { Suspense, useState } from 'react'
import { signIn }        from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link              from 'next/link'
import { useForm }       from 'react-hook-form'
import { zodResolver }   from '@hookform/resolvers/zod'
import { z }             from 'zod'
import { Input }         from '@/components/ui/Input'
import { Button }        from '@/components/ui/Button'

const Schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})
type FormData = z.infer<typeof Schema>

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [error,   setError]   = useState(searchParams.get('error') === 'unauthorized' ? 'Acceso no autorizado' : '')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(Schema) })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { ...data, redirect: false })
    if (res?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/mi-cuenta')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-brand-tan/20">
        <h1 className="font-serif text-2xl text-brand-charcoal mb-1 text-center">Iniciar sesión</h1>
        <p className="text-sm text-brand-muted text-center mb-7">Accede a tu cuenta Velunisa</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Contraseña" type="password" error={errors.password?.message} {...register('password')} />

          {error && (
            <div className="bg-red-50 border border-brand-red/20 rounded-lg p-3 text-sm text-brand-red text-center">
              {error}
            </div>
          )}

          <Button type="submit" variant="dark" size="lg" className="w-full" loading={loading}>
            Ingresar
          </Button>
        </form>

        <div className="mt-5 text-center space-y-3">
          <p className="text-sm text-brand-muted">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-brand-charcoal font-semibold hover:text-brand-tan transition-colors">
              Regístrate aquí
            </Link>
          </p>
          <Link href="/recuperar" className="block text-xs text-brand-muted hover:text-brand-charcoal transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-64 bg-white rounded-2xl animate-pulse" />}>
      <LoginForm />
    </Suspense>
  )
}
