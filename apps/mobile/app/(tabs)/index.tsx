import { useEffect, useState } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  Dimensions, FlatList, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Image }  from 'expo-image'
import { productsApi } from '../../lib/api'

const { width } = Dimensions.get('window')

const CATEGORIES = [
  { name: 'Baby Shower',    slug: 'baby-shower',    emoji: '🍼', bg: '#FFF0F3' },
  { name: 'Bodas',          slug: 'bodas',          emoji: '💍', bg: '#FFF8F0' },
  { name: 'Cumpleaños',     slug: 'cumpleanos',     emoji: '🎂', bg: '#FFFAF0' },
  { name: 'Días Especiales', slug: 'dias-especiales', emoji: '🌸', bg: '#F5F0FF' },
]

interface Product {
  id: string; name: string; slug: string; price: string; images: string[]; isNew: boolean
  comparePrice: string | null; category: { name: string }
}

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    productsApi.getAll({ isFeatured: 'true' })
      .then(setFeatured)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroSub}>Wax Melts Artesanales</Text>
        <Text style={styles.heroTitle}>Aromas para{'\n'}cada ocasión 🌸</Text>
        <TouchableOpacity style={styles.heroCta} onPress={() => router.push('/tienda')}>
          <Text style={styles.heroCtaText}>Ver tienda →</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Colecciones</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.slug}
              style={[styles.categoryCard, { backgroundColor: cat.bg }]}
              onPress={() => router.push(`/tienda?category=${cat.slug}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Products */}
      <View style={[styles.section, { paddingHorizontal: 0 }]}>
        <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>Destacados</Text>
        {loading ? (
          <ActivityIndicator color="#4F5353" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            horizontal
            data={featured}
            keyExtractor={p => p.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => router.push(`/producto/${item.slug}`)}
                activeOpacity={0.9}
              >
                <View style={styles.productImageContainer}>
                  <Image
                    source={{ uri: item.images?.[0] ?? '' }}
                    style={styles.productImage}
                    contentFit="cover"
                    placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.' }}
                  />
                  {item.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.badgeText}>Nuevo</Text>
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>{item.category?.name}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productPrice}>${parseFloat(item.price).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Trust badges */}
      <View style={styles.trustSection}>
        {[
          { icon: '🌿', label: '100% Natural' },
          { icon: '✋', label: 'Artesanal' },
          { icon: '🚚', label: 'A todo Ecuador' },
          { icon: '💛', label: 'Con garantía' },
        ].map(b => (
          <View key={b.label} style={styles.trustItem}>
            <Text style={styles.trustIcon}>{b.icon}</Text>
            <Text style={styles.trustLabel}>{b.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  hero: {
    backgroundColor: '#ECDBCE',
    padding: 28,
    paddingTop: 40,
    paddingBottom: 32,
  },
  heroSub:    { fontSize: 11, color: '#888888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle:  { fontSize: 30, fontWeight: '700', color: '#4F5353', lineHeight: 36, marginBottom: 20 },
  heroCta:    { alignSelf: 'flex-start', backgroundColor: '#4F5353', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 50 },
  heroCtaText:{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  section:       { padding: 20, paddingTop: 28 },
  sectionTitle:  { fontSize: 20, fontWeight: '700', color: '#4F5353', marginBottom: 16 },

  categoryGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard:  {
    width:  (width - 50) / 2,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: { fontSize: 32 },
  categoryName:  { fontSize: 13, fontWeight: '600', color: '#4F5353', textAlign: 'center' },

  productCard: {
    width:         180,
    backgroundColor: '#FFFFFF',
    borderRadius:  12,
    overflow:      'hidden',
    borderWidth:   1,
    borderColor:   '#DBBBA4',
    shadowColor:   '#0C1B2C',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius:  8,
    elevation:     2,
  },
  productImageContainer: { position: 'relative' },
  productImage:  { width: 180, height: 180 },
  newBadge:      { position: 'absolute', top: 8, left: 8, backgroundColor: '#ECDBCE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText:     { fontSize: 10, fontWeight: '700', color: '#4F5353' },
  productInfo:   { padding: 12, gap: 2 },
  productCategory: { fontSize: 10, color: '#888888', textTransform: 'uppercase', letterSpacing: 1 },
  productName:   { fontSize: 13, fontWeight: '600', color: '#4F5353', lineHeight: 18 },
  productPrice:  { fontSize: 15, fontWeight: '700', color: '#4F5353', marginTop: 4 },

  trustSection: {
    flexDirection:  'row',
    backgroundColor: '#4F5353',
    padding: 20,
    justifyContent: 'space-around',
  },
  trustItem:  { alignItems: 'center', gap: 4 },
  trustIcon:  { fontSize: 22 },
  trustLabel: { fontSize: 10, color: '#DBBBA4', fontWeight: '600', textAlign: 'center' },
})
