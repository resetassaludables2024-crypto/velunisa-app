import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Dimensions,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'
import { Search } from 'lucide-react-native'
import { productsApi } from '../../lib/api'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

interface Product {
  id: string; name: string; slug: string; price: string
  comparePrice: string | null; images: string[]; isNew: boolean
  category: { name: string }
}

export default function TiendaScreen() {
  const params  = useLocalSearchParams<{ category?: string; q?: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState(params.q ?? '')

  const load = useCallback(async (q?: string) => {
    setLoading(true)
    const apiParams: Record<string, string> = {}
    if (params.category) apiParams.category = params.category
    if (q)               apiParams.q = q
    const data = await productsApi.getAll(apiParams).catch(() => [])
    setProducts(data)
    setLoading(false)
  }, [params.category])

  useEffect(() => { load() }, [load])

  function handleSearch() { load(search) }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Search size={16} color="#888888" />
          <TextInput
            style={styles.searchText}
            placeholder="Buscar wax melts..."
            placeholderTextColor="#888888"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#4F5353" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={p => p.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No se encontraron productos 🕯️</Text>
          }
          renderItem={({ item }) => {
            const price = parseFloat(item.price)
            const compare = item.comparePrice ? parseFloat(item.comparePrice) : null
            const imgUrl = item.images?.[0] ?? ''
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/producto/${item.slug}`)}
                activeOpacity={0.85}
              >
                <View style={styles.imageWrap}>
                  <Image source={{ uri: imgUrl }} style={styles.image} contentFit="cover" />
                  {item.isNew && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Nuevo</Text>
                    </View>
                  )}
                  {compare && compare > price && (
                    <View style={[styles.badge, styles.ofertaBadge]}>
                      <Text style={[styles.badgeText, { color: '#fff' }]}>Oferta</Text>
                    </View>
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.cat}>{item.category?.name}</Text>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>${price.toFixed(2)}</Text>
                    {compare && compare > price && (
                      <Text style={styles.comparePrice}>${compare.toFixed(2)}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFBFB' },
  searchRow: { padding: 12, paddingBottom: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#DBBBA420' },
  searchInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBFBFB', borderRadius: 10, paddingHorizontal: 12, gap: 8, height: 40, borderWidth: 1, borderColor: '#DBBBA4' },
  searchText: { flex: 1, fontSize: 14, color: '#0C1B2C' },
  grid:   { padding: 16, gap: 12, paddingBottom: 32 },
  row:    { gap: 12 },
  empty:  { textAlign: 'center', color: '#888888', marginTop: 40, fontSize: 15 },
  card:   { width: CARD_WIDTH, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#DBBBA420', shadowColor: '#0C1B2C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  imageWrap: { position: 'relative' },
  image: { width: CARD_WIDTH, height: CARD_WIDTH, backgroundColor: '#FBFBFB' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#ECDBCE', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  ofertaBadge: { backgroundColor: '#E63946', left: 'auto', right: 8 },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#4F5353' },
  info: { padding: 10, gap: 2 },
  cat:  { fontSize: 9, color: '#888888', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: 13, fontWeight: '600', color: '#4F5353', lineHeight: 17 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  price: { fontSize: 14, fontWeight: '700', color: '#4F5353' },
  comparePrice: { fontSize: 12, color: '#888888', textDecorationLine: 'line-through' },
})
