import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import { Stack, router } from 'expo-router'
import { Package, Search } from 'lucide-react-native'
import { MMKV } from 'react-native-mmkv'
import { ordersApi } from '../lib/api'

const BRAND = {
  charcoal: '#4F5353',
  tan:      '#DBBBA4',
  cream:    '#F5F0E8',
  bg:       '#FBFBFB',
  muted:    '#888888',
  white:    '#FFFFFF',
}

const storage = new MMKV({ id: 'velunisa-auth' })

const STATUS_LABEL: Record<string, string> = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmado',
  PROCESSING: 'Preparando',
  SHIPPED:    'Enviado',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING:    '#F59E0B',
  CONFIRMED:  '#3B82F6',
  PROCESSING: '#8B5CF6',
  SHIPPED:    '#6366F1',
  DELIVERED:  '#22C55E',
  CANCELLED:  '#EF4444',
}

function formatPrice(n: number) { return `$${n.toFixed(2)}` }

interface Order {
  id: string; orderNumber: string; status: string; total: string
  createdAt: string; items: { id: string }[]
}

function getUser() {
  try { return JSON.parse(storage.getString('user') ?? 'null') } catch { return null }
}

export default function MisPedidosScreen() {
  const user              = getUser()
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [query,   setQuery]   = useState('')

  async function searchOrder() {
    const q = query.trim().toUpperCase()
    if (!q) return
    setLoading(true)
    try {
      const order = await ordersApi.getByNumber(q)
      if (order) {
        setOrders([order])
      } else {
        Alert.alert('No encontrado', `No se encontró el pedido ${q}`)
        setOrders([])
      }
    } catch {
      Alert.alert('Error', 'No se pudo buscar el pedido. Verifica el número e inténtalo de nuevo.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ title: 'Mis pedidos' }} />
        <View style={styles.center}>
          <Package size={52} color={BRAND.tan} />
          <Text style={styles.emptyTitle}>Inicia sesión para ver tus pedidos</Text>
          <Text style={styles.emptySub}>O ingresa un número de pedido para rastrearlo</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>Iniciar sesión →</Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Mis pedidos' }} />
      <View style={styles.container}>

        {/* Search bar */}
        <View style={styles.searchSection}>
          <Text style={styles.searchLabel}>Buscar pedido por número</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="VEL-2024-00001"
              placeholderTextColor={BRAND.muted}
              autoCapitalize="characters"
              returnKeyType="search"
              onSubmitEditing={searchOrder}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={searchOrder} disabled={loading}>
              {loading
                ? <ActivityIndicator size="small" color={BRAND.white} />
                : <Search size={20} color={BRAND.white} />
              }
            </TouchableOpacity>
          </View>
        </View>

        {orders.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
            <Text style={styles.emptyTitle}>Hola, {user.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.emptySub}>
              Ingresa tu número de pedido (ej: VEL-2024-00001) para ver el estado.
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={o => o.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: order }) => (
              <View style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <View>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('es-EC', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={[styles.statusBadge, { color: STATUS_COLOR[order.status] ?? BRAND.muted }]}>
                      ● {STATUS_LABEL[order.status] ?? order.status}
                    </Text>
                    <Text style={styles.orderTotal}>{formatPrice(parseFloat(order.total))}</Text>
                  </View>
                </View>
                <Text style={styles.orderItemCount}>
                  {order.items?.length ?? 0} producto{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                </Text>

                {/* Progress bar */}
                <OrderProgress status={order.status} />
              </View>
            )}
          />
        )}
      </View>
    </>
  )
}

const STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const STEP_LABELS = ['Recibido', 'Preparando', 'En camino', 'Entregado']

function OrderProgress({ status }: { status: string }) {
  const idx = STEPS.indexOf(status)
  return (
    <View style={progressStyles.container}>
      {STEPS.map((s, i) => (
        <View key={s} style={progressStyles.step}>
          <View style={[progressStyles.dot, i <= idx && progressStyles.dotActive]}>
            {i <= idx && <View style={progressStyles.dotInner} />}
          </View>
          <Text style={[progressStyles.label, i <= idx && progressStyles.labelActive]}>
            {STEP_LABELS[i]}
          </Text>
          {i < STEPS.length - 1 && (
            <View style={[progressStyles.line, i < idx && progressStyles.lineActive]} />
          )}
        </View>
      ))}
    </View>
  )
}

const progressStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16, gap: 0 },
  step:      { flex: 1, alignItems: 'center', position: 'relative' },
  dot:       { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: BRAND.tan, backgroundColor: BRAND.white, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  dotActive: { borderColor: BRAND.charcoal, backgroundColor: BRAND.charcoal },
  dotInner:  { width: 6, height: 6, borderRadius: 3, backgroundColor: BRAND.white },
  label:     { fontSize: 10, color: BRAND.muted, marginTop: 4, textAlign: 'center' },
  labelActive: { color: BRAND.charcoal, fontWeight: '600' },
  line:      { position: 'absolute', top: 7, left: '50%', right: '-50%', height: 2, backgroundColor: BRAND.tan + '50', zIndex: 0 },
  lineActive:{ backgroundColor: BRAND.charcoal },
})

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: BRAND.bg },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle:     { fontSize: 20, fontWeight: '700', color: BRAND.charcoal, textAlign: 'center' },
  emptySub:       { fontSize: 13, color: BRAND.muted, textAlign: 'center', lineHeight: 20 },
  loginBtn:       { backgroundColor: BRAND.charcoal, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  loginBtnText:   { color: BRAND.white, fontWeight: '700', fontSize: 15 },
  searchSection:  { backgroundColor: BRAND.white, margin: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BRAND.tan + '30' },
  searchLabel:    { fontSize: 13, fontWeight: '600', color: BRAND.charcoal, marginBottom: 10 },
  searchRow:      { flexDirection: 'row', gap: 8 },
  searchInput:    { flex: 1, borderWidth: 1.5, borderColor: BRAND.tan, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: BRAND.charcoal, fontVariant: ['tabular-nums'] },
  searchBtn:      { backgroundColor: BRAND.charcoal, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', minWidth: 52 },
  list:           { padding: 16, gap: 14 },
  orderCard:      { backgroundColor: BRAND.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BRAND.tan + '30' },
  orderTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNumber:    { fontSize: 15, fontWeight: '700', color: BRAND.charcoal, fontVariant: ['tabular-nums'] },
  orderDate:      { fontSize: 11, color: BRAND.muted, marginTop: 3 },
  orderRight:     { alignItems: 'flex-end' },
  statusBadge:    { fontSize: 12, fontWeight: '700' },
  orderTotal:     { fontSize: 17, fontWeight: '800', color: BRAND.charcoal, marginTop: 3 },
  orderItemCount: { fontSize: 12, color: BRAND.muted, marginTop: 8 },
})
