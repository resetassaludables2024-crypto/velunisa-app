import Link from 'next/link'

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Minimal header */}
      <header className="bg-white border-b border-brand-tan/30 py-4">
        <div className="container-velunisa flex items-center justify-between">
          <Link href="/" className="font-serif font-bold text-xl tracking-widest text-brand-charcoal uppercase">
            Velunisa
          </Link>
          <span className="text-xs text-brand-muted">Pago seguro 🔒</span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
