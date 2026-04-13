import { redirect }     from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions }   from '@/lib/auth'
import { AdminSidebar }  from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/login?error=unauthorized')
  }

  return (
    <div className="min-h-screen flex bg-brand-bg">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 laptop:p-8">
        {children}
      </main>
    </div>
  )
}
