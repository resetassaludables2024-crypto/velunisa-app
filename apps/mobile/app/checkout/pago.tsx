import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Copy, CheckCircle } from 'lucide-react-native'
import * as Clipboard from 'expo-clipboard'
import { ordersApi } from '../../lib/api'
import { useCartStore } from '../../store/cart.store'
import Toast from 'react-native-toast-message'

const BRAND = {
  charcoal: '#4F5353',
  tan:      '#DBBBA4',
  cream:    '#F5F0E8',
  bg:       '#FBFBFB',
  muted:    '#888888',
  dark:     '#2C2C2C',
  white:    '#FFFFFF',
  blue:     '#3B82F6',
}

const BANK_INFO = {
  banco:   'Banco Pichincha',
  tipo:    'Cuenta Corriente',
  numero:  '2207654321',
  titular: 'Velunisa S.A.',
  ruc:     '0912345678001',
}

const SHIPPING_COST = 5.00

function formatPrice(n: number) { return `$${n.toFixed(2)}` }

export default function PagoScreen() {
  const params      = useLocalSearchParams<{
    nombre: string; email: string; telefono: string
    ciudad: string; direccion: string; provincia: string; notas: string
  }>()
  const { items, total, clearCart } = useCartStore()
  const [bankRef,   setBankRef]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [copied,    setCopied]    = useState<string | null>(null)

  const orderTotal = total + SHIPPING_COST

  async function copyToClipboard(text: string, key: string) {
    await Clipboard.setStringAsync(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      // 1. Create order — format must match CreateOrderSchema in /api/orders
      const [firstName, ...rest] = params.nombre.trim().split(' ')
      const lastName = rest.join(' ') || firstName

      const orderPayload = {
        guestEmail: params.email,
        notes:      params.notas || undefined,
        shippingAddress: {
          firstName,
          lastName,
          phone:    params.telefono,
          address:  params.direccion,
          city:     params.ciudad,
          province: params.provincia || 'Ecuador',
        },
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId ?? undefined,
          quantity:  item.quantity,
        })),
      }

      const order = await ordersApi.create(orderPayload)

      // 2. Submit transfer proof (reference only)
      if (bankRef.trim()) {
        await ordersApi.submitTransferProof(order.orderNumber, {
          bankTransferRef: bankRef.trim(),
        })
      }

      // 3. Clear cart and navigate to confirmation
      clearCart()
      router.replace({
        pathname: '/checkout/confirmacion',
        params:   { orderNumber: order.orderNumber, email: params.email },
      })
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al procesar el pedido. Inténtalo de nuevo.'
      Alert.alert('Error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Pago por transferencia' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total a pagar</Text>
          <Text style={styles.totalValue}>{formatPrice(orderTotal)}</Text>
          <Text style={styles.totalSub}>Incluye envío: {formatPrice(SHIPPING_COST)}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Instrucciones de pago</Text>
          <Text style={styles.instruction}>
            1. Realiza la transferencia al número de cuenta que aparece a continuación.{'\n'}
            2. Ingresa el número de referencia o comprobante en el campo de abajo.{'\n'}
            3. Confirma el pedido. Recibirás un email de confirmación.
          </Text>
        </View>

        {/* Bank info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏦 Datos bancarios</Text>
          {Object.entries({
            'Banco':    BANK_INFO.banco,
            'Tipo':     BANK_INFO.tipo,
            'Número':   BANK_INFO.numero,
            'Titular':  BANK_INFO.titular,
            'RUC':      BANK_INFO.ruc,
          }).map(([key, val]) => (
            <View key={key} style={styles.bankRow}>
              <View style={styles.bankInfo}>
                <Text style={styles.bankKey}>{key}</Text>
                <Text style={styles.bankVal}>{val}</Text>
              </View>
              {(key === 'Número' || key === 'RUC') && (
                <TouchableOpacity onPress={() => copyToClipboard(val, key)} style={styles.copyBtn}>
                  {copied === key
                    ? <CheckCircle size={18} color={BRAND.tan} />
                    : <Copy size={18} color={BRAND.muted} />
                  }
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Reference input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Comprobante de pago</Text>
          <Text style={styles.refHint}>Ingresa el número de referencia o comprobante de tu transferencia (opcional pero recomendado).</Text>
          <TextInput
            style={styles.refInput}
            value={bankRef}
            onChangeText={setBankRef}
            placeholder="Ej: 123456789"
            placeholderTextColor={BRAND.muted}
            keyboardType="default"
          />
        </View>

        {/* Order summary mini */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Tu pedido ({items.length} producto{items.length !== 1 ? 's' : ''})</Text>
          {items.map(item => (
            <View key={item.id} style={styles.summaryItem}>
              <Text style={styles.summaryItemName} numberOfLines={1}>{item.product.name}</Text>
              {item.variant && <Text style={styles.summaryItemVariant}>{item.variant.name}</Text>}
              <Text style={styles.summaryItemPrice}>
                x{item.quantity} · {formatPrice((item.variant?.price ?? item.product.price) * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={{ height: 8 }} />
          <View style={styles.totalRow}>
            <Text style={styles.totalRowLabel}>Subtotal</Text>
            <Text style={styles.totalRowVal}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalRowLabel}>Envío</Text>
            <Text style={styles.totalRowVal}>{formatPrice(SHIPPING_COST)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: BRAND.tan + '30' }]}>
            <Text style={[styles.totalRowLabel, { fontWeight: '700', color: BRAND.charcoal }]}>Total</Text>
            <Text style={[styles.totalRowVal, { fontWeight: '800', fontSize: 16 }]}>{formatPrice(orderTotal)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyBar}>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnLoading]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={BRAND.white} />
            : <Text style={styles.confirmBtnText}>✅ Confirmar pedido · {formatPrice(orderTotal)}</Text>
          }
        </TouchableOpacity>
        <Text style={styles.secureNote}>🔒 Pago seguro mediante transferencia bancaria</Text>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: BRAND.bg },
  totalCard:        { backgroundColor: BRAND.charcoal, margin: 16, borderRadius: 16, padding: 20, alignItems: 'center' },
  totalLabel:       { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  totalValue:       { color: BRAND.white, fontSize: 32, fontWeight: '800', marginVertical: 4 },
  totalSub:         { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  section:          { backgroundColor: BRAND.white, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BRAND.tan + '30' },
  sectionTitle:     { fontSize: 15, fontWeight: '700', color: BRAND.charcoal, marginBottom: 12 },
  instruction:      { fontSize: 13, color: BRAND.muted, lineHeight: 22 },
  bankRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BRAND.tan + '20' },
  bankInfo:         { flex: 1 },
  bankKey:          { fontSize: 11, color: BRAND.muted, marginBottom: 2 },
  bankVal:          { fontSize: 14, color: BRAND.charcoal, fontWeight: '600' },
  copyBtn:          { padding: 8 },
  refHint:          { fontSize: 12, color: BRAND.muted, marginBottom: 12, lineHeight: 18 },
  refInput:         { borderWidth: 1.5, borderColor: BRAND.tan, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: BRAND.dark },
  summaryItem:      { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: BRAND.tan + '20' },
  summaryItemName:  { fontSize: 13, fontWeight: '600', color: BRAND.charcoal },
  summaryItemVariant: { fontSize: 11, color: BRAND.muted, marginTop: 1 },
  summaryItemPrice: { fontSize: 12, color: BRAND.muted, marginTop: 1 },
  totalRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalRowLabel:    { fontSize: 13, color: BRAND.muted },
  totalRowVal:      { fontSize: 13, color: BRAND.charcoal, fontWeight: '600' },
  stickyBar:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: BRAND.white, borderTopWidth: 1, borderTopColor: BRAND.tan + '40', padding: 16, gap: 8 },
  confirmBtn:       { backgroundColor: BRAND.charcoal, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  confirmBtnLoading:{ opacity: 0.7 },
  confirmBtnText:   { color: BRAND.white, fontWeight: '700', fontSize: 16 },
  secureNote:       { textAlign: 'center', fontSize: 11, color: BRAND.muted },
})
