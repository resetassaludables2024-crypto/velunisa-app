import { redirect }         from 'next/navigation'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { PromoBar }          from '@/components/layout/PromoBar'
import { Header }            from '@/components/layout/Header'
import { Footer }            from '@/components/layout/Footer'
import { CartDrawer }        from '@/components/cart/CartDrawer'
import { ChatWidget }        from '@/components/chat/ChatWidget'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <>
      <PromoBar />
      <Header />
      <main className="min-h-screen bg-brand-bg">
        <div className="container-velunisa py-10">
          {children}
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </>
  )
}
