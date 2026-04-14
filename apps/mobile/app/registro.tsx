import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native'
import { router, Stack } from 'expo-router'
import { Eye, EyeOff } from 'lucide-react-native'
import { authApi, api } from '../lib/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'

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

export default function RegistroScreen() {
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  async function handleRegister() {
    setError(null)
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Completa nombre, email y contraseña')
      return
    }
    if (!email.includes('@')) {
      setError('Email inválido')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await authApi.register({ name: name.trim(), email: email.trim().toLowerCase(), password, phone: phone.trim() || undefined })
      // Auto-login after register
      const res  = await api.post('/api/mobile/auth', { email: email.trim().toLowerCase(), password })
      const { user, token } = res.data
      await AsyncStorage.setItem('velunisa-user',  JSON.stringify(user))
      await AsyncStorage.setItem('velunisa-token', token)
      Toast.show({ type: 'success', text1: `¡Bienvenida, ${user.name}! 🌸`, position: 'bottom' })
      router.replace('/')
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al crear la cuenta'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Crear cuenta' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🕯️</Text>
            <Text style={styles.logoText}>Velunisa</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Crear cuenta</Text>
            <Text style={styles.formSub}>Únete a la familia Velunisa 🌸</Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Field label="Nombre completo *" value={name} onChange={setName} placeholder="María García" />
            <Field label="Correo electrónico *" value={email} onChange={setEmail} placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Teléfono (opcional)" value={phone} onChange={setPhone} placeholder="+593 99 999 9999" keyboardType="phone-pad" />

            {/* Password fields */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Contraseña *</Text>
              <View style={styles.pwdRow}>
                <TextInput
                  style={[styles.fieldInput, { flex: 1, marginBottom: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={BRAND.muted}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={styles.eyeBtn}>
                  {showPwd ? <EyeOff size={18} color={BRAND.muted} /> : <Eye size={18} color={BRAND.muted} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Confirmar contraseña *</Text>
              <TextInput
                style={styles.fieldInput}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Repite tu contraseña"
                placeholderTextColor={BRAND.muted}
                secureTextEntry={!showPwd}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={BRAND.white} />
                : <Text style={styles.registerBtnText}>Crear cuenta</Text>
              }
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.loginLink}> Iniciar sesión →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}

function Field({
  label, value, onChange, placeholder, keyboardType, autoCapitalize,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; keyboardType?: any; autoCapitalize?: any
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={BRAND.muted}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:       { flexGrow: 1, backgroundColor: BRAND.bg, padding: 24, justifyContent: 'center' },
  logoWrap:        { alignItems: 'center', marginBottom: 24 },
  logoEmoji:       { fontSize: 44, marginBottom: 6 },
  logoText:        { fontSize: 24, fontWeight: '800', color: BRAND.charcoal, letterSpacing: 1 },
  form:            { backgroundColor: BRAND.white, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: BRAND.tan + '40' },
  formTitle:       { fontSize: 20, fontWeight: '700', color: BRAND.charcoal, marginBottom: 4 },
  formSub:         { fontSize: 13, color: BRAND.muted, marginBottom: 20 },
  errorBox:        { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText:       { color: BRAND.red, fontSize: 13 },
  field:           { marginBottom: 14 },
  fieldLabel:      { fontSize: 13, fontWeight: '600', color: BRAND.charcoal, marginBottom: 6 },
  fieldInput:      { borderWidth: 1.5, borderColor: BRAND.tan, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: BRAND.dark, backgroundColor: BRAND.bg },
  pwdRow:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:          { padding: 12, backgroundColor: BRAND.bg, borderWidth: 1.5, borderColor: BRAND.tan, borderRadius: 12 },
  registerBtn:     { backgroundColor: BRAND.charcoal, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  registerBtnText: { color: BRAND.white, fontWeight: '700', fontSize: 16 },
  loginRow:        { flexDirection: 'row', justifyContent: 'center' },
  loginText:       { fontSize: 13, color: BRAND.muted },
  loginLink:       { fontSize: 13, color: BRAND.charcoal, fontWeight: '700' },
})
