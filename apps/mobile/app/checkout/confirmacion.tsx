import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef } from 'react'

const BRAND = {
  charcoal: '#4F5353',
  tan:      '#DBBBA4',
  cream:    '#F5F0E8',
  bg:       '#FBFBFB',
  muted:    '#888888',
  white:    '#FFFFFF',
  green:    '#22C55E',
}

export default function ConfirmacionScreen() {
  const { orderNumber, email } = useLocalSearchParams<{ orderNumber: string; email: string }>()
  const scaleAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 10,
      stiffness: 100,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <>
      <Stack.Screen options={{ title: 'Pedido confirmado', headerLeft: () => null }} />
      <View style={styles.container}>

        {/* Success animation */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.iconText}>🎉</Text>
        </Animated.View>

        <Text style={styles.title}>¡Pedido confirmado!</Text>
        <Text style={styles.subtitle}>Gracias por tu compra en Velunisa 🌸</Text>

        {/* Order number */}
        <View style={styles.orderBox}>
          <Text style={styles.orderLabel}>Número de pedido</Text>
          <Text style={styles.orderNumber}>{orderNumber}</Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsBox}>
          <Text style={styles.stepsTitle}>¿Qué sigue?</Text>
          {[
            { icon: '📧', text: `Te enviamos un email a ${email} con los detalles del pedido` },
            { icon: '🔍', text: 'Revisamos tu comprobante de transferencia en máximo 24 horas' },
            { icon: '📦', text: 'Preparamos tu pedido con mucho amor artesanal' },
            { icon: '🚚', text: 'Tu pedido llega a domicilio en 3-5 días hábiles' },
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Contact note */}
        <View style={styles.contactBox}>
          <Text style={styles.contactText}>
            ¿Dudas? Contáctanos por WhatsApp y te ayudamos al instante 💬
          </Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.primaryBtnText}>Seguir comprando →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BRAND.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconCircle:   { width: 100, height: 100, borderRadius: 50, backgroundColor: BRAND.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  iconText:     { fontSize: 48 },
  title:        { fontSize: 26, fontWeight: '800', color: BRAND.charcoal, textAlign: 'center', marginBottom: 8 },
  subtitle:     { fontSize: 15, color: BRAND.muted, textAlign: 'center', marginBottom: 24 },
  orderBox:     { backgroundColor: BRAND.white, borderWidth: 1, borderColor: BRAND.tan, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 20, width: '100%' },
  orderLabel:   { fontSize: 12, color: BRAND.muted, marginBottom: 4 },
  orderNumber:  { fontSize: 22, fontWeight: '800', color: BRAND.charcoal, fontFamily: 'monospace', letterSpacing: 1 },
  stepsBox:     { backgroundColor: BRAND.white, borderWidth: 1, borderColor: BRAND.tan + '40', borderRadius: 16, padding: 16, width: '100%', marginBottom: 16 },
  stepsTitle:   { fontSize: 14, fontWeight: '700', color: BRAND.charcoal, marginBottom: 12 },
  step:         { flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'flex-start' },
  stepIcon:     { fontSize: 18, width: 24 },
  stepText:     { fontSize: 13, color: BRAND.muted, flex: 1, lineHeight: 20 },
  contactBox:   { backgroundColor: BRAND.cream, borderRadius: 12, padding: 12, marginBottom: 24, width: '100%' },
  contactText:  { fontSize: 13, color: BRAND.charcoal, textAlign: 'center', lineHeight: 20 },
  ctaRow:       { width: '100%', gap: 12 },
  primaryBtn:   { backgroundColor: BRAND.charcoal, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: BRAND.white, fontWeight: '700', fontSize: 16 },
})
