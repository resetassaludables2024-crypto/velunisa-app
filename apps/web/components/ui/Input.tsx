import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  helper?:  string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-brand-charcoal mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-lg border border-brand-tan bg-white text-brand-dark placeholder:text-brand-muted',
            'text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand-tan focus:border-brand-tan',
            'disabled:bg-brand-bg disabled:cursor-not-allowed',
            error && 'border-brand-red focus:ring-brand-red/30',
            className
          )}
          {...props}
        />
        {error  && <p className="mt-1.5 text-xs text-brand-red">{error}</p>}
        {helper && !error && <p className="mt-1.5 text-xs text-brand-muted">{helper}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export { Input }
