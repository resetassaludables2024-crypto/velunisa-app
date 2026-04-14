import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native'
import { router, Stack, Link } from 'expo-router'
import { Eye, EyeOff } from 'lucide-react-native'
import { api } from '../lib/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { registerForPushNotifications, savePushTokenToServer } from '../lib/notifications'

const BRAND = {
  charcoal: '#4F5353',
  tan:      '#DBBBA4',
  cream:    '#F5F0E8',
  bg:       '#FBFBFB',
  muted:    '#888888',
  dark:     '#2C2C2C',
  white:    '#FFFFFF',
  red:      '#EF4444',
}

export default function LoginScreen() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Completa email y contraseña')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/mobile/auth', { email: email.trim().toLowerCase(), password })
      const { user, token } = res.data
      // Store session locally
      await AsyncStorage.setItem('velunisa-user',  JSON.stringify(user))
      await AsyncStorage.setItem('velunisa-token', token)
      // Save push token to server (best-effort)
      registerForPushNotifications()
        .then(pushToken => { if (pushToken) savePushTokenToServer(pushToken, user.id) })
        .catch(() => {})
      Toast.show({ type: 'success', text1: `¡Hola, ${user.name}! 🌸`, position: 'bottom' })
      router.back()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Credenciales inválidas'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Iniciar sesión' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🕯️</Text>
            <Text style={styles.logoText}>Velunisa</Text>
            <Text style={styles.logoSub}>Wax melts artesanales</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Bienvenida de vuelta</Text>
            <Text style={styles.formSub}>Inicia sesión para ver tus pedidos y más</Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Correo electrónico</Text>
              <TextInput
                style={styles.fieldInput}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor={BRAND.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Contraseña</Text>
              <View style={styles.pwdRow}>
                <TextInput
                  style={[styles.fieldInput, { flex: 1, marginBottom: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={BRAND.muted}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={styles.eyeBtn}>
                  {showPwd ? <EyeOff size={18} color={BRAND.muted} /> : <Eye size={18} color={BRAND.muted} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={BRAND.white} />
                : <Text style={styles.loginBtnText}>Iniciar sesión</Text>
              }
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.replace('/registro')}>
                <Text style={styles.registerLink}> Crear cuenta →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa sin cuenta</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.guestBtn} onPress={() => router.back()}>
              <Text style={styles.guestBtnText}>Continuar como invitado</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  container:    { flexGrow: 1, backgroundColor: BRAND.bg, padding: 24, justifyContent: 'center' },
  logoWrap:     { alignItems: 'center', marginBottom: 32 },
  logoEmoji:    { fontSize: 52, marginBottom: 8 },
  logoText:     { fontSize: 28, fontWeight: '800', color: BRAND.charcoal, letterSpacing: 1 },
  logoSub:      { fontSize: 13, color: BRAND.muted, marginTop: 4 },
  form:         { backgroundColor: BRAND.white, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: BRAND.tan + '40' },
  formTitle:    { fontSize: 20, fontWeight: '700', color: BRAND.charcoal, marginBottom: 4 },
  formSub:      { fontSize: 13, color: BRAND.muted, marginBottom: 20 },
  errorBox:     { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText:    { color: BRAND.red, fontSize: 13 },
  field:        { marginBottom: 16 },
  fieldLabel:   { fontSize: 13, fontWeight: '600', color: BRAND.charcoal, marginBottom: 6 },
  fieldInput:   { borderWidth: 1.5, borderColor: BRAND.tan, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: BRAND.dark, backgroundColor: BRAND.bg },
  pwdRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:       { padding: 12, backgroundColor: BRAND.bg, borderWidth: 1.5, borderColor: BRAND.tan, borderRadius: 12 },
  loginBtn:     { backgroundColor: BRAND.charcoal, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  loginBtnText: { color: BRAND.white, fontWeight: '700', fontSize: 16 },
  registerRow:  { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  registerText: { fontSize: 13, color: BRAND.muted },
  registerLink: { fontSize: 13, color: BRAND.charcoal, fontWeight: '700' },
  divider:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  dividerLine:  { flex: 1, height: 1, backgroundColor: BRAND.tan + '40' },
  dividerText:  { fontSize: 12, color: BRAND.muted },
  guestBtn:     { borderWidth: 1.5, borderColor: BRAND.tan, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  guestBtnText: { color: BRAND.charcoal, fontWeight: '600', fontSize: 14 },
})
