import { PromoBar } from '@/components/layout/PromoBar'
import { Header }   from '@/components/layout/Header'
import { Footer }   from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ChatWidget } from '@/components/chat/ChatWidget'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PromoBar />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </>
  )
}
