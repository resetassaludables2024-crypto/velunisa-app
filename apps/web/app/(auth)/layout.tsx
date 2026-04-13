import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="py-6 text-center">
        <Link href="/" className="font-serif font-bold text-2xl tracking-widest text-brand-charcoal uppercase">
          Velunisa
        </Link>
      </header>
      <main className="flex-1 flex items-start justify-center pt-8 px-4">
        {children}
      </main>
    </div>
  )
}
