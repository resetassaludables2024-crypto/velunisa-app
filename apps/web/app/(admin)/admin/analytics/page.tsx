import { prisma }      from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics — Admin' }

async function getAnalytics() {
  const now   = new Date()
  const day30 = new Date(now); day30.setDate(now.getDate() - 29)
  const day7  = new Date(now); day7.setDate(now.getDate() - 6)

  const [
    confirmedOrders,
    allOrders,
    topProducts,
    paymentBreakdown,
    recentDailyOrders,
  ] = await Promise.all([
    // Revenue last 30 days
    prisma.order.findMany({
      where:   { paymentStatus: 'CONFIRMED', createdAt: { gte: day30 } },
      select:  { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    // All orders last 30 days
    prisma.order.findMany({
      where:   { createdAt: { gte: day30 } },
      select:  { total: true, createdAt: true, paymentStatus: true, status: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Top products (by quantity sold)
    prisma.orderItem.groupBy({
      by:      ['name'],
      _sum:    { quantity: true },
      _count:  { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take:    8,
    }),
    // Payment status breakdown
    prisma.order.groupBy({
      by:      ['paymentStatus'],
      _count:  { id: true },
    }),
    // Orders per day last 7 days
    prisma.order.findMany({
      where:   { createdAt: { gte: day7 } },
      select:  { createdAt: true, total: true, paymentStatus: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // --- Build daily revenue map (last 30 days) ---
  const dailyMap: Record<string, { revenue: number; orders: number }> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(day30); d.setDate(day30.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    dailyMap[key] = { revenue: 0, orders: 0 }
  }
  for (const o of confirmedOrders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10)
    if (dailyMap[key]) {
      dailyMap[key].revenue += parseFloat(o.total.toString())
      dailyMap[key].orders  += 1
    }
  }
  for (const o of allOrders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10)
    if (dailyMap[key]) dailyMap[key].orders += 0 // already counted above, skip double-counting
  }

  // --- Rebuild daily with all orders count ---
  const dailyFull: Record<string, { revenue: number; orders: number }> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(day30); d.setDate(day30.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    dailyFull[key] = { revenue: 0, orders: 0 }
  }
  for (const o of confirmedOrders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10)
    if (dailyFull[key]) dailyFull[key].revenue += parseFloat(o.total.toString())
  }
  for (const o of allOrders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10)
    if (dailyFull[key]) dailyFull[key].orders += 1
  }

  const dailyData = Object.entries(dailyFull).map(([date, d]) => ({ date, ...d }))

  // --- KPIs ---
  const totalRevenue      = confirmedOrders.reduce((s, o) => s + parseFloat(o.total.toString()), 0)
  const totalOrders30     = allOrders.length
  const confirmedOrders30 = confirmedOrders.length
  const avgOrder          = confirmedOrders30 > 0 ? totalRevenue / confirmedOrders30 : 0

  // Prev 30 days for comparison
  const prev30Start = new Date(day30); prev30Start.setDate(day30.getDate() - 30)
  const prevRevenue = await prisma.order.aggregate({
    where: { paymentStatus: 'CONFIRMED', createdAt: { gte: prev30Start, lt: day30 } },
    _sum:  { total: true },
  })
  const prevRev    = prevRevenue._sum.total ? parseFloat(prevRevenue._sum.total.toString()) : 0
  const revDelta   = prevRev > 0 ? ((totalRevenue - prevRev) / prevRev) * 100 : null

  return {
    totalRevenue,
    totalOrders30,
    confirmedOrders30,
    avgOrder,
    revDelta,
    dailyData,
    topProducts,
    paymentBreakdown,
  }
}

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })
}

export default async function AnalyticsPage() {
  const data = await getAnalytics()

  const maxRevenue = Math.max(...data.dailyData.map(d => d.revenue), 1)
  const maxOrders  = Math.max(...data.dailyData.map(d => d.orders), 1)
  const maxQty     = Math.max(...data.topProducts.map(p => p._sum.quantity ?? 0), 1)

  const paymentLabels: Record<string, { label: string; color: string }> = {
    AWAITING_TRANSFER:  { label: 'Esperando',    color: 'bg-amber-400' },
    TRANSFER_SUBMITTED: { label: 'En revisión',  color: 'bg-blue-400' },
    CONFIRMED:          { label: 'Confirmado',   color: 'bg-green-500' },
    FAILED:             { label: 'Fallido',      color: 'bg-red-400' },
    REFUNDED:           { label: 'Reembolsado',  color: 'bg-gray-400' },
  }

  const totalPayments = data.paymentBreakdown.reduce((s, p) => s + p._count.id, 0)

  return (
    <div>
      <h1 className="font-serif text-2xl text-brand-charcoal mb-8">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 laptop:grid-cols-4 gap-5 mb-10">
        <KpiCard
          label="Ingresos (30 días)"
          value={formatPrice(data.totalRevenue)}
          sub={data.revDelta !== null ? `${data.revDelta > 0 ? '+' : ''}${data.revDelta.toFixed(1)}% vs mes anterior` : 'Sin datos anteriores'}
          trend={data.revDelta !== null ? (data.revDelta >= 0 ? 'up' : 'down') : 'neutral'}
        />
        <KpiCard label="Pedidos (30 días)" value={String(data.totalOrders30)} sub={`${data.confirmedOrders30} confirmados`} />
        <KpiCard label="Ticket promedio" value={formatPrice(data.avgOrder)} sub="Pedidos confirmados" />
        <KpiCard
          label="Tasa de confirmación"
          value={data.totalOrders30 > 0 ? `${Math.round((data.confirmedOrders30 / data.totalOrders30) * 100)}%` : '—'}
          sub={`${data.confirmedOrders30} de ${data.totalOrders30}`}
        />
      </div>

      <div className="grid laptop:grid-cols-3 gap-6 mb-6">

        {/* Revenue chart */}
        <div className="laptop:col-span-2 bg-white rounded-xl border border-brand-tan/20 p-6">
          <h2 className="font-serif text-lg text-brand-charcoal mb-6">Ingresos últimos 30 días</h2>
          <div className="flex items-end gap-1 h-40">
            {data.dailyData.map((d, i) => {
              const h = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0
              const isWeekend = new Date(d.date + 'T00:00:00').getDay() % 6 === 0
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-brand-charcoal text-white text-[10px] rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    {formatDayLabel(d.date)}: {formatPrice(d.revenue)}
                  </div>
                  <div
                    className={`w-full rounded-t-sm transition-all ${isWeekend ? 'bg-brand-tan' : 'bg-brand-charcoal/80'} group-hover:bg-brand-charcoal`}
                    style={{ height: `${Math.max(h, d.revenue > 0 ? 4 : 1)}%` }}
                  />
                </div>
              )
            })}
          </div>
          {/* X labels - show every 7th */}
          <div className="flex items-center mt-3">
            {data.dailyData.map((d, i) => (
              <div key={d.date} className="flex-1 text-center">
                {i % 7 === 0 && (
                  <span className="text-[10px] text-brand-muted">{formatDayLabel(d.date)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment status breakdown */}
        <div className="bg-white rounded-xl border border-brand-tan/20 p-6">
          <h2 className="font-serif text-lg text-brand-charcoal mb-6">Estado de pagos</h2>
          <div className="space-y-4">
            {data.paymentBreakdown.map(p => {
              const cfg = paymentLabels[p.paymentStatus] ?? { label: p.paymentStatus, color: 'bg-gray-300' }
              const pct = totalPayments > 0 ? (p._count.id / totalPayments) * 100 : 0
              return (
                <div key={p.paymentStatus}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-brand-charcoal">{cfg.label}</span>
                    <span className="text-sm font-semibold text-brand-charcoal">{p._count.id}</span>
                  </div>
                  <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {data.paymentBreakdown.length === 0 && (
              <p className="text-sm text-brand-muted text-center py-8">Sin pedidos aún</p>
            )}
          </div>
        </div>
      </div>

      {/* Orders per day + Top products */}
      <div className="grid laptop:grid-cols-2 gap-6">

        {/* Orders per day bar */}
        <div className="bg-white rounded-xl border border-brand-tan/20 p-6">
          <h2 className="font-serif text-lg text-brand-charcoal mb-6">Pedidos por día (30 días)</h2>
          <div className="flex items-end gap-1 h-32">
            {data.dailyData.map(d => {
              const h = maxOrders > 0 ? (d.orders / maxOrders) * 100 : 0
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-brand-charcoal text-white text-[10px] rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    {formatDayLabel(d.date)}: {d.orders} pedido{d.orders !== 1 ? 's' : ''}
                  </div>
                  <div
                    className="w-full rounded-t-sm bg-brand-tan group-hover:bg-brand-charcoal transition-colors"
                    style={{ height: `${Math.max(h, d.orders > 0 ? 6 : 1)}%` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex items-center mt-3">
            {data.dailyData.map((d, i) => (
              <div key={d.date} className="flex-1 text-center">
                {i % 7 === 0 && (
                  <span className="text-[10px] text-brand-muted">{formatDayLabel(d.date)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-xl border border-brand-tan/20 p-6">
          <h2 className="font-serif text-lg text-brand-charcoal mb-6">Productos más vendidos</h2>
          <div className="space-y-4">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-brand-muted text-center py-8">Sin ventas aún</p>
            ) : data.topProducts.map((p, i) => {
              const qty = p._sum.quantity ?? 0
              const pct = maxQty > 0 ? (qty / maxQty) * 100 : 0
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-brand-muted w-4 flex-shrink-0">
                        #{i + 1}
                      </span>
                      <span className="text-sm text-brand-charcoal truncate">{p.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-brand-charcoal flex-shrink-0 ml-2">
                      {qty} uds
                    </span>
                  </div>
                  <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-charcoal/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label, value, sub, trend,
}: {
  label: string; value: string; sub?: string; trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="bg-white rounded-xl border border-brand-tan/20 p-5">
      <p className="text-xs text-brand-muted mb-1">{label}</p>
      <p className="text-2xl font-bold text-brand-charcoal">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 ${
          trend === 'up'   ? 'text-green-600' :
          trend === 'down' ? 'text-red-500'   :
          'text-brand-muted'
        }`}>
          {trend === 'up' ? '↑ ' : trend === 'down' ? '↓ ' : ''}{sub}
        </p>
      )}
    </div>
  )
}
