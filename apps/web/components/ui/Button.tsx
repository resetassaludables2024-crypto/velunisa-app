import { forwardRef } from 'react'
import { Slot }       from '@radix-ui/react-slot'
import { cn }         from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'ghost'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const variants = {
      primary:   'bg-brand-cream text-brand-charcoal hover:bg-brand-tan hover:shadow-md',
      secondary: 'border border-brand-charcoal text-brand-charcoal hover:bg-brand-cream',
      dark:      'bg-brand-charcoal text-white hover:bg-brand-dark hover:shadow-md',
      ghost:     'text-brand-charcoal hover:bg-brand-cream/50',
    }
    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    }
    const spinner = loading ? (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : null

    return (
      <Comp
        ref={ref as any}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {/* asChild (Slot) requiere exactamente un hijo React — no agregar el spinner */}
        {asChild ? children : <>{spinner}{children}</>}
      </Comp>
    )
  }
)
Button.displayName = 'Button'
export { Button }
