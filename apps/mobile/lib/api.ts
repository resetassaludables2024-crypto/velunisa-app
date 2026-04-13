import axios from 'axios'
import Constants from 'expo-constants'

const API_URL = Constants.expoConfig?.extra?.apiUrl
  ?? process.env.EXPO_PUBLIC_API_URL
  ?? 'https://velunisa.com'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Products
export const productsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/api/products', { params }).then(r => r.data.data),
  getBySlug: (slug: string) =>
    api.get(`/api/products?slug=${slug}`).then(r => r.data.data?.[0]),
}

// Orders
export const ordersApi = {
  create: (data: object)           => api.post('/api/orders', data).then(r => r.data.data),
  getByNumber: (orderNumber: string) =>
    api.get(`/api/orders/${orderNumber}`).then(r => r.data.data),
  submitTransferProof: (orderNumber: string, data: object) =>
    api.post(`/api/orders/${orderNumber}/transfer-proof`, data).then(r => r.data),
}

// Auth
export const authApi = {
  register: (data: object) => api.post('/api/auth/register', data).then(r => r.data),
}

// Chat
export const chatApi = {
  sendMessage: (message: string, sessionId: string) =>
    api.post('/api/chat', { message, sessionId }),
}
