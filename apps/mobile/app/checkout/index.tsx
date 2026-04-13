import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert,
} from 'react-native'
import { router, Stack } from 'expo-router'
import { Image } from 'expo-image'
import { useCartStore } from '../../store/cart.store'

const BRAND = {
  charcoal: '#4F5353',
  tan:      '#DBBBA4',
  cream:    '#F5F0E8',
  bg:       '#FBFBFB',
  muted:    '#888888',
  dark:     '#2C2C2C',
  white:    '#FFFFFF',
}

function formatPrice(n: number) { return `$${n.toFixed(2)}` }

const SHIPPING_COST = 5.00

export default function CheckoutScreen() {
  const { items, total } = useCartStore()

  const [nombre,    setNombre]    = useState('')
  const [email,     setEmail]     = useState('')
  const [telefono,  setTelefono]  = useState('')
  const [ciudad,    setCiudad]    = useState('')
  const [direccion, setDireccion] = useState('')
  const [provincia, setProvincia] = useState('')
  const [notas,     setNotas]     = useState('')

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/tienda')}>
          <Text style={styles.btnText}>Ver tienda</Text>
        </TouchableOpacity>
      </View>
    )
  }

  function handleContinue() {
    if (!nombre.trim() || !email.trim() || !telefono.trim() || !ciudad.trim() || !direccion.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios')
      return
    }
    if (!email.includes('@')) {
      Alert.alert('Email inválido', 'Ingresa un correo electrónico válido')
      return
    }
    router.push({
      pathname: '/checkout/pago',
      params: { nombre, email, telefono, ciudad, direccion, provincia, notas },
    })
  }

  const subtotal  = total
  const orderTotal = subtotal + SHIPPING_COST

  return (
    <>
      <Stack.Screen options={{ title: 'Datos de envío' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          {items.map(item => {
            const imgUrl   = item.product.images[0]
            const itemPrice = (item.variant?.price ?? item.product.price) * item.quantity
            return (
              <View key={item.id} style={styles.orderItem}>
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={styles.orderItemImg} contentFit="cover" />
                ) : (
                  <View style={[styles.orderItemImg, { backgroundColor: BRAND.cream, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text>🕯️</Text>
                  </View>
                )}
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName} numberOfLines={2}>{item.product.name}</Text>
                  {item.variant && <Text style={styles.orderItemVariant}>{item.variant.name}</Text>}
                  <Text style={styles.orderItemQty}>Cantidad: {item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>{formatPrice(itemPrice)}</Text>
              </View>
            )
          })}
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Envío estimado</Text>
              <Text style={styles.totalValue}>{formatPrice(SHIPPING_COST)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.totalFinalLabel}>Total</Text>
              <Text style={styles.totalFinalValue}>{formatPrice(orderTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Shipping form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de envío</Text>

          <Field label="Nombre completo *" value={nombre} onChange={setNombre} placeholder="Ej: María García" />
          <Field label="Correo electrónico *" value={email} onChange={setEmail} placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Teléfono / WhatsApp *" value={telefono} onChange={setTelefono} placeholder="+593 99 999 9999" keyboardType="phone-pad" />
          <Field label="Ciudad *" value={ciudad} onChange={setCiudad} placeholder="Guayaquil, Quito, Cuenca..." />
          <Field label="Provincia" value={provincia} onChange={setProvincia} placeholder="Guayas, Pichincha..." />
          <Field label="Dirección completa *" value={direccion} onChange={setDireccion} placeholder="Calle, número, barrio..." multiline lines={3} />
          <Field label="Notas adicionales" value={notas} onChange={setNotas} placeholder="Referencias, indicaciones de entrega..." multiline lines={2} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyBar}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continuar al pago → {formatPrice(orderTotal)}</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

function Field({
  label, value, onChange, placeholder, keyboardType, autoCapitalize, multiline, lines,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; keyboardType?: any; autoCapitalize?: any; multiline?: boolean; lines?: number
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { height: (lines ?? 2) * 22 + 24, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={BRAND.muted}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
        multiline={multiline}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: BRAND.bg },
  empty:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyIcon:      { fontSize: 52 },
  emptyTitle:     { fontSize: 18, color: BRAND.charcoal, fontWeight: '600' },
  btn:            { backgroundColor: BRAND.charcoal, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  btnText:        { color: BRAND.white, fontWeight: '700', fontSize: 15 },
  section:        { backgroundColor: BRAND.white, margin: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BRAND.tan + '30' },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: BRAND.charcoal, marginBottom: 16 },
  orderItem:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  orderItemImg:   { width: 56, height: 56, borderRadius: 10 },
  orderItemInfo:  { flex: 1 },
  orderItemName:  { fontSize: 13, fontWeight: '600', color: BRAND.charcoal },
  orderItemVariant: { fontSize: 11, color: BRAND.muted, marginTop: 2 },
  orderItemQty:   { fontSize: 11, color: BRAND.muted },
  orderItemPrice: { fontSize: 14, fontWeight: '700', color: BRAND.charcoal },
  totalsBox:      { borderTopWidth: 1, borderTopColor: BRAND.tan + '30', marginTop: 12, paddingTop: 12, gap: 6 },
  totalRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:     { fontSize: 13, color: BRAND.muted },
  totalValue:     { fontSize: 13, color: BRAND.charcoal },
  totalRowFinal:  { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: BRAND.tan + '30' },
  totalFinalLabel:{ fontSize: 16, fontWeight: '700', color: BRAND.charcoal },
  totalFinalValue:{ fontSize: 18, fontWeight: '800', color: BRAND.charcoal },
  field:          { marginBottom: 14 },
  fieldLabel:     { fontSize: 13, fontWeight: '600', color: BRAND.charcoal, marginBottom: 6 },
  fieldInput:     { borderWidth: 1.5, borderColor: BRAND.tan, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: BRAND.dark, backgroundColor: BRAND.bg },
  stickyBar:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: BRAND.white, borderTopWidth: 1, borderTopColor: BRAND.tan + '40', padding: 16 },
  continueBtn:    { backgroundColor: BRAND.charcoal, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  continueBtnText:{ color: BRAND.white, fontWeight: '700', fontSize: 16 },
})
