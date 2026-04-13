import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert
} from 'react-native'
import { router } from 'expo-router'
import { Image }  from 'expo-image'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-native'
import { useCartStore } from '../../store/cart.store'

export default function CartScreen() {
  const { items, removeItem, updateQty, total } = useCartStore()
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <ShoppingBag size={52} color="#DBBBA4" />
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptyDesc}>Agrega algunos wax melts para comenzar 🌸</Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/tienda')}>
          <Text style={styles.ctaBtnText}>Ver productos</Text>
        </TouchableOpacity>
      </View>
    )
  }

  function confirmRemove(itemId: string) {
    Alert.alert('Eliminar', '¿Deseas eliminar este producto del carrito?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeItem(itemId) },
    ])
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const price  = item.variant?.price ?? item.product.price
          const imgUrl = item.product.images[0] ?? ''
          return (
            <View style={styles.item}>
              <Image source={{ uri: imgUrl }} style={styles.image} contentFit="cover" />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                {item.variant && <Text style={styles.itemVariant}>{item.variant.name}</Text>}
                <Text style={styles.itemPrice}>${(price * item.quantity).toFixed(2)}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.quantity - 1)}>
                    <Minus size={14} color="#4F5353" />
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.quantity + 1)}>
                    <Plus size={14} color="#4F5353" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmRemove(item.id)}>
                    <Trash2 size={14} color="#E63946" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        }}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
          <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Envío</Text>
          <Text style={[styles.summaryValue, { color: '#22C55E' }]}>Gratis</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push('/checkout')}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>Proceder al pago →</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFBFB' },
  list:      { padding: 16, gap: 12, paddingBottom: 8 },
  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle:{ fontSize: 20, fontWeight: '700', color: '#4F5353', textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: '#888888', textAlign: 'center', lineHeight: 20 },
  ctaBtn:    { backgroundColor: '#4F5353', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 50, marginTop: 8 },
  ctaBtnText:{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  item: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, gap: 12, borderWidth: 1, borderColor: '#DBBBA420' },
  image:     { width: 76, height: 76, borderRadius: 8, backgroundColor: '#FBFBFB' },
  itemInfo:  { flex: 1, gap: 2 },
  itemName:  { fontSize: 13, fontWeight: '600', color: '#4F5353', lineHeight: 17 },
  itemVariant: { fontSize: 11, color: '#888888' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#4F5353' },
  qtyRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  qtyBtn:    { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#DBBBA4', alignItems: 'center', justifyContent: 'center' },
  qty:       { fontSize: 14, fontWeight: '600', color: '#4F5353', minWidth: 20, textAlign: 'center' },
  deleteBtn: { marginLeft: 'auto', padding: 6 },
  summary:   { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#DBBBA420', gap: 10 },
  summaryRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: '#888888' },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#4F5353' },
  totalRow:  { borderTopWidth: 1, borderTopColor: '#DBBBA420', paddingTop: 10 },
  totalLabel:{ fontSize: 15, fontWeight: '700', color: '#4F5353' },
  totalValue:{ fontSize: 18, fontWeight: '700', color: '#4F5353' },
  checkoutBtn: { backgroundColor: '#4F5353', paddingVertical: 16, borderRadius: 50, alignItems: 'center', marginTop: 4 },
  checkoutBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
})
