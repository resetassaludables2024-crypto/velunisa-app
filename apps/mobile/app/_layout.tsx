import { useEffect }   from 'react'
import { Stack }        from 'expo-router'
import { StatusBar }    from 'expo-status-bar'
import Toast            from 'react-native-toast-message'
import { registerForPushNotifications } from '../lib/notifications'

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotifications().catch(console.error)
  }, [])

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle:        { backgroundColor: '#FFFFFF' },
          headerTintColor:    '#4F5353',
          headerTitleStyle:   { fontWeight: '700', fontSize: 16 },
          headerBackTitleVisible: false,
          contentStyle:       { backgroundColor: '#FBFBFB' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="producto/[slug]" options={{ title: 'Producto' }} />
        <Stack.Screen name="checkout/index"  options={{ title: 'Checkout' }} />
        <Stack.Screen name="checkout/pago"   options={{ title: 'Pago' }} />
        <Stack.Screen name="checkout/confirmacion" options={{ title: 'Confirmación', headerLeft: () => null }} />
        <Stack.Screen name="login"           options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="registro"        options={{ title: 'Crear cuenta' }} />
        <Stack.Screen name="mis-pedidos"     options={{ title: 'Mis pedidos' }} />
      </Stack>
      <Toast />
    </>
  )
}
