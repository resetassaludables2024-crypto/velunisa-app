import { Tabs }    from 'expo-router'
import { Home, ShoppingBag, ShoppingCart, User, MessageCircle } from 'lucide-react-native'
import { useCartStore } from '../../store/cart.store'

export default function TabsLayout() {
  const itemCount = useCartStore(s => s.itemCount)

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   '#4F5353',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor:  '#DBBBA4',
          borderTopWidth:  1,
          paddingBottom:   4,
          height:          60,
        },
        tabBarLabelStyle: {
          fontSize:   10,
          fontWeight: '600',
          marginTop:  2,
        },
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#4F5353',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:       'Inicio',
          tabBarIcon:  ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: 'Velunisa',
        }}
      />
      <Tabs.Screen
        name="tienda"
        options={{
          title:      'Tienda',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          title:      'Carrito',
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tabs.Screen
        name="luna"
        options={{
          title:      'Luna IA',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
          headerTitle: 'Luna 🌸',
          headerStyle: { backgroundColor: '#ECDBCE' },
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title:      'Mi cuenta',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
