import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'nuevo' | 'oferta' | 'default'
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  const variants = {
    nuevo:   'bg-brand-cream text-brand-charcoal',
    oferta:  'bg-brand-red text-white',
    default: 'bg-brand-charcoal/10 text-brand-charcoal',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
