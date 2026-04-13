import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native'
import { router } from 'expo-router'
import {
  Package, ChevronRight, HelpCircle, Instagram,
  MessageCircle, LogIn,
} from 'lucide-react-native'

export default function CuentaScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🌸</Text>
        </View>
        <Text style={styles.headerTitle}>Mi cuenta</Text>
        <Text style={styles.headerSub}>Velunisa</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pedidos</Text>

        <MenuRow
          icon={<Package size={18} color="#4F5353" />}
          label="Mis pedidos"
          onPress={() => router.push('/mis-pedidos')}
        />
      </View>

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
          icon={<HelpCircle size={18} color="#888888" />}
          label="Preguntas frecuentes"
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <MenuRow
          icon={<LogIn size={18} color="#4F5353" />}
          label="Iniciar sesión"
          sublabel="Accede a tu cuenta"
          onPress={() => router.push('/login')}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Velunisa — Wax Melts Artesanales Ecuador</Text>
        <Text style={styles.footerVersion}>v1.0.0</Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

function MenuRow({ icon, label, sublabel, onPress }: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIcon}>{icon}</View>
      <View style={styles.menuText}>
        <Text style={styles.menuLabel}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      <ChevronRight size={16} color="#DBBBA4" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFBFB' },
  header: { backgroundColor: '#4F5353', alignItems: 'center', paddingTop: 40, paddingBottom: 28, gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ECDBCE', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#ECDBCE' },
  headerSub:   { fontSize: 13, color: '#DBBBA4' },
  section: { paddingTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#888888', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, paddingHorizontal: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 8, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FBFBFB', alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#4F5353' },
  menuSublabel: { fontSize: 12, color: '#888888', marginTop: 1 },
  footer: { marginTop: 24, alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: '#888888' },
  footerVersion: { fontSize: 11, color: '#DBBBA4' },
})
