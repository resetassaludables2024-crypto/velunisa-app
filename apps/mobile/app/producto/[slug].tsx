import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, Alert,
} from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { Image } from 'expo-image'
import { ShoppingCart, ChevronLeft, Star } from 'lucide-react-native'
import { productsApi } from '../../lib/api'
import { useCartStore, MobileCartProduct } from '../../store/cart.store'
import Toast from 'react-native-toast-message'

const { width } = Dimensions.get('window')

const BRAND = {
  charcoal: '#4F5353',
  tan:      '#DBBBA4',
  cream:    '#F5F0E8',
  bg:       '#FBFBFB',
  muted:    '#888888',
  dark:     '#2C2C2C',
  white:    '#FFFFFF',
  red:      '#EF4444',
  green:    '#22C55E',
}

interface Variant { id: string; name: string; price: number; stock: number }
interface Product {
  id: string; name: string; slug: string; price: string
  comparePrice: string | null; images: string[]; description: string
  isNew: boolean; isFeatured: boolean; stock: number; sku: string
  category: { name: string; slug: string }
  variants: Variant[]
}

function formatPrice(n: number) {
  return `$${n.toFixed(2)}`
}

export default function ProductoScreen() {
  const { slug }    = useLocalSearchParams<{ slug: string }>()
  const addItem     = useCartStore(s => s.addItem)
  const [product,   setProduct]   = useState<Product | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [imgIndex,  setImgIndex]  = useState(0)
  const [variant,   setVariant]   = useState<Variant | null>(null)
  const [qty,       setQty]       = useState(1)

  useEffect(() => {
    if (!slug) return
    productsApi.getBySlug(slug)
      .then((p: Product) => {
        setProduct(p)
        if (p?.variants?.length > 0) setVariant(p.variants[0])
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar el producto'))
      .finally(() => setLoading(false))
  }, [slug])

  function handleAddToCart() {
    if (!product) return
    const cartProduct: MobileCartProduct = {
      id:           product.id,
      name:         product.name,
      slug:         product.slug,
      price:        parseFloat(product.price),
      comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      images:       product.images,
    }
    const cartVariant = variant
      ? { id: variant.id, name: variant.name, price: variant.price }
      : null
    addItem(cartProduct, cartVariant, qty)
    Toast.show({
      type:   'success',
      text1:  '¡Agregado al carrito! 🛒',
      text2:  product.name,
      position: 'bottom',
    })
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND.tan} />
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Producto no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const price        = parseFloat(product.price)
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null
  const hasDiscount  = comparePrice && comparePrice > price
  const activeVariant = variant
  const activePrice   = activeVariant ? activeVariant.price : price
  const activeStock   = activeVariant ? activeVariant.stock : product.stock
  const inStock       = activeStock > 0

  const images = product.images.length > 0 ? product.images : []

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: -4, padding: 8 }}>
              <ChevronLeft size={22} color={BRAND.charcoal} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image gallery */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}
          >
            {images.length > 0 ? images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={{ width, height: width }}
                contentFit="cover"
              />
            )) : (
              <View style={[styles.imagePlaceholder, { width, height: width }]}>
                <Text style={styles.imagePlaceholderText}>🕯️</Text>
              </View>
            )}
          </ScrollView>
          {/* Dots */}
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
              ))}
            </View>
          )}
          {/* Badges */}
          <View style={styles.badges}>
            {product.isNew     && <View style={[styles.badge, { backgroundColor: BRAND.charcoal }]}><Text style={styles.badgeText}>Nuevo</Text></View>}
            {hasDiscount       && <View style={[styles.badge, { backgroundColor: '#EF4444' }]}><Text style={styles.badgeText}>Oferta</Text></View>}
          </View>
        </View>

        <View style={styles.info}>
          {/* Category */}
          <Text style={styles.category}>{product.category.name.toUpperCase()}</Text>

          {/* Name */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(activePrice)}</Text>
            {hasDiscount && !activeVariant && (
              <Text style={styles.comparePrice}>{formatPrice(comparePrice!)}</Text>
            )}
          </View>

          {/* Variants */}
          {product.variants.length > 0 && (
            <View style={styles.variantsSection}>
              <Text style={styles.variantLabel}>Tamaño / Presentación</Text>
              <View style={styles.variantRow}>
                {product.variants.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.variantBtn, variant?.id === v.id && styles.variantBtnActive, v.stock === 0 && styles.variantBtnDisabled]}
                    onPress={() => { if (v.stock > 0) setVariant(v) }}
                    disabled={v.stock === 0}
                  >
                    <Text style={[styles.variantBtnText, variant?.id === v.id && styles.variantBtnTextActive]}>
                      {v.name}
                    </Text>
                    <Text style={[styles.variantPrice, variant?.id === v.id && styles.variantBtnTextActive]}>
                      {formatPrice(v.price)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Qty */}
          <View style={styles.qtyRow}>
            <Text style={styles.variantLabel}>Cantidad</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity onPress={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity onPress={() => setQty(q => Math.min(activeStock, q + 1))} style={styles.qtyBtn} disabled={qty >= activeStock}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stock */}
          <Text style={[styles.stock, { color: inStock ? BRAND.green : BRAND.red }]}>
            {activeStock > 10 ? `✅ En stock (${activeStock} disponibles)` : activeStock > 0 ? `⚠️ Últimas ${activeStock} unidades` : '❌ Agotado'}
          </Text>

          {/* Description */}
          <View style={styles.divider} />
          <Text style={styles.descTitle}>Descripción</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Trust badges */}
          <View style={styles.trustRow}>
            {[{ icon: '🌿', label: '100% Natural' }, { icon: '✋', label: 'Hecho a mano' }, { icon: '🚚', label: 'Envío nacional' }].map(b => (
              <View key={b.label} style={styles.trustItem}>
                <Text style={styles.trustIcon}>{b.icon}</Text>
                <Text style={styles.trustLabel}>{b.label}</Text>
              </View>
            ))}
          </View>

          {/* Spacer for sticky button */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyBar}>
        <View style={styles.stickyPrice}>
          <Text style={styles.stickyPriceLabel}>Total</Text>
          <Text style={styles.stickyPriceValue}>{formatPrice(activePrice * qty)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, !inStock && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={!inStock}
        >
          <ShoppingCart size={18} color={BRAND.white} />
          <Text style={styles.addBtnText}>{inStock ? 'Agregar al carrito' : 'Agotado'}</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: BRAND.bg },
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound:           { fontSize: 18, color: BRAND.charcoal, marginBottom: 12 },
  link:               { color: BRAND.tan, fontSize: 14 },
  imagePlaceholder:   { backgroundColor: BRAND.cream, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 64 },
  dots:               { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 12, left: 0, right: 0, gap: 4 },
  dot:                { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotActive:          { backgroundColor: BRAND.white, width: 16 },
  badges:             { position: 'absolute', top: 12, left: 12, gap: 6 },
  badge:              { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:          { color: BRAND.white, fontSize: 11, fontWeight: '700' },
  info:               { padding: 20 },
  category:           { fontSize: 11, color: BRAND.muted, letterSpacing: 1.5, fontWeight: '600', marginBottom: 6 },
  name:               { fontSize: 26, fontWeight: '700', color: BRAND.charcoal, lineHeight: 32, marginBottom: 12 },
  priceRow:           { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  price:              { fontSize: 24, fontWeight: '800', color: BRAND.charcoal },
  comparePrice:       { fontSize: 16, color: BRAND.muted, textDecorationLine: 'line-through' },
  variantsSection:    { marginBottom: 20 },
  variantLabel:       { fontSize: 13, fontWeight: '600', color: BRAND.charcoal, marginBottom: 10 },
  variantRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  variantBtn:         { borderWidth: 1.5, borderColor: BRAND.tan, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', minWidth: 80 },
  variantBtnActive:   { borderColor: BRAND.charcoal, backgroundColor: BRAND.charcoal },
  variantBtnDisabled: { opacity: 0.4 },
  variantBtnText:     { fontSize: 13, fontWeight: '600', color: BRAND.charcoal },
  variantBtnTextActive: { color: BRAND.white },
  variantPrice:       { fontSize: 11, color: BRAND.muted, marginTop: 2 },
  qtyRow:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  qtyControls:        { flexDirection: 'row', alignItems: 'center', gap: 0 },
  qtyBtn:             { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: BRAND.tan, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText:         { fontSize: 20, color: BRAND.charcoal, lineHeight: 24 },
  qtyValue:           { width: 40, textAlign: 'center', fontSize: 16, fontWeight: '700', color: BRAND.charcoal },
  stock:              { fontSize: 12, marginBottom: 16 },
  divider:            { height: 1, backgroundColor: BRAND.tan + '30', marginVertical: 20 },
  descTitle:          { fontSize: 15, fontWeight: '700', color: BRAND.charcoal, marginBottom: 8 },
  description:        { fontSize: 14, color: BRAND.charcoal + 'BB', lineHeight: 22 },
  trustRow:           { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: BRAND.tan + '30' },
  trustItem:          { alignItems: 'center', gap: 4 },
  trustIcon:          { fontSize: 22 },
  trustLabel:         { fontSize: 11, color: BRAND.muted, textAlign: 'center' },
  stickyBar:          { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: BRAND.white, borderTopWidth: 1, borderTopColor: BRAND.tan + '40', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  stickyPrice:        { flex: 1 },
  stickyPriceLabel:   { fontSize: 11, color: BRAND.muted },
  stickyPriceValue:   { fontSize: 20, fontWeight: '800', color: BRAND.charcoal },
  addBtn:             { flex: 2, backgroundColor: BRAND.charcoal, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addBtnDisabled:     { backgroundColor: BRAND.muted },
  addBtnText:         { color: BRAND.white, fontWeight: '700', fontSize: 15 },
})
