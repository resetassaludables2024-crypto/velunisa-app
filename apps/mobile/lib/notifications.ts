import * as Notifications from 'expo-notifications'
import Constants           from 'expo-constants'
import { Platform }        from 'react-native'
import { api }             from './api'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Constants.isDevice) return null

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })).data

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name:       'default',
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  return token
}

export async function savePushTokenToServer(token: string, userId?: string): Promise<void> {
  try {
    await api.post('/api/user/push-token', { token, userId })
  } catch {
    // Silent — push is best-effort
  }
}
