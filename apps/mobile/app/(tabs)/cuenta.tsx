import { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  Package, ChevronRight, HelpCircle, Instagram,
  MessageCircle, LogIn, LogOut, User,
} from 'lucide-react-native'

const BRAND = {
  charcoal: '#4F5353',
  tan:      '#DBBBA4',
  cream:    '#ECDBCE',
  bg:       '#FBFBFB',
  muted:    '#888888',
  white:    '#FFFFFF',
  red:      '#EF4444',
}

interface UserSession {
  id:    string
  name:  string
  email: string
  phone?: string
  role:  string
}

export default function CuentaScreen() {
  const [user, setUser] = useState<UserSession | null>(null)

  // Re-check auth every time this tab gets focused
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('velunisa-user')
        .then(v => setUser(v ? JSON.parse(v) : null))
        .catch(() => setUser(null))
    }, [])
  )

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás segura?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['velunisa-user', 'velunisa-token'])
          setUser(null)
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      {user ? (
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.headerTitle}>{user.name}</Text>
          <Text style={styles.headerSub}>{user.email}</Text>
        </View>
      ) : (
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🌸</Text>
          </View>
          <Text style={styles.headerTitle}>Mi cuenta</Text>
          <Text style={styles.headerSub}>Velunisa</Text>
        </View>
      )}

      {/* Pedidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pedidos</Text>
        <MenuRow
          icon={<Package size={18} color={BRAND.charcoal} />}
          label="Mis pedidos"
          onPress={() => router.push('/mis-pedidos')}
        />
      </View>

      {/* Ayuda */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ayuda</Text>
        <MenuRow
          icon={<MessageCircle size={18} color="#25D366" />}
          label="WhatsApp"
          sublabel="Contáctanos"
          onPress={() => Linking.openURL('https://wa.me/593999999999?text=Hola Velunisa!')}
        />
        <MenuRow
          icon={<Instagram size={18} color="#E1306C" />}
          label="Instagram"
          sublabel="@velunisa_oficial"
          onPress={() => Linking.openURL('https://instagram.com/velunisa')}
        />
        <MenuRow
          icon={<HelpCircle size={18} color={BRAND.muted} />}
          label="Preguntas frecuentes"
          onPress={() => {}}
        />
      </View>

      {/* Auth section */}
      <View style={styles.section}>
        {user ? (
          <MenuRow
            icon={<LogOut size={18} color={BRAND.red} />}
            label="Cerrar sesión"
            labelStyle={{ color: BRAND.red }}
            onPress={handleLogout}
          />
        ) : (
          <>
            <MenuRow
              icon={<LogIn size={18} color={BRAND.charcoal} />}
              label="Iniciar sesión"
              sublabel="Accede a tu cuenta"
              onPress={() => router.push('/login')}
            />
            <MenuRow
              icon={<User size={18} color={BRAND.charcoal} />}
              label="Crear cuenta"
              sublabel="Regístrate gratis"
              onPress={() => router.push('/registro')}
            />
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Velunisa — Wax Melts Artesanales Ecuador</Text>
        <Text style={styles.footerVersion}>v1.0.0</Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

function MenuRow({ icon, label, sublabel, onPress, labelStyle }: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onPress: () => void
  labelStyle?: object
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIcon}>{icon}</View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, labelStyle]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      <ChevronRight size={16} color={BRAND.tan} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BRAND.bg },
  header:       { backgroundColor: BRAND.charcoal, alignItems: 'center', paddingTop: 40, paddingBottom: 28, gap: 8 },
  avatar:       { width: 72, height: 72, borderRadius: 36, backgroundColor: BRAND.cream, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 32, fontWeight: '700', color: BRAND.charcoal },
  headerTitle:  { fontSize: 22, fontWeight: '700', color: BRAND.cream },
  headerSub:    { fontSize: 13, color: BRAND.tan },
  section:      { paddingTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: BRAND.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, paddingHorizontal: 4 },
  menuRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND.white, padding: 16, borderRadius: 12, marginBottom: 8, gap: 12 },
  menuIcon:     { width: 36, height: 36, borderRadius: 10, backgroundColor: BRAND.bg, alignItems: 'center', justifyContent: 'center' },
  menuText:     { flex: 1 },
  menuLabel:    { fontSize: 14, fontWeight: '600', color: BRAND.charcoal },
  menuSublabel: { fontSize: 12, color: BRAND.muted, marginTop: 1 },
  footer:       { marginTop: 24, alignItems: 'center', gap: 4 },
  footerText:   { fontSize: 12, color: BRAND.muted },
  footerVersion:{ fontSize: 11, color: BRAND.tan },
})
