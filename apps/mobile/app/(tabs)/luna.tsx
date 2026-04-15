import { useState, useRef, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, Keyboard,
} from 'react-native'
import { chatApi } from '../../lib/api'
import { useFocusEffect } from 'expo-router'

const BRAND = {
  charcoal: '#4F5353',
  tan:      '#DBBBA4',
  cream:    '#ECDBCE',
  bg:       '#FBFBFB',
  muted:    '#888888',
  white:    '#FFFFFF',
}

interface Message {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  '¿Qué son los wax melts?',
  '¿Tienen para baby shower?',
  '¿Cómo hago un pedido?',
  '¿Cuánto demora el envío?',
]

let sessionId = `mobile-${Date.now()}`

export default function LunaScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id:      'welcome',
      role:    'assistant',
      content: '¡Hola! Soy Luna 🌸, tu asistente de Velunisa.\n\n¿En qué te puedo ayudar hoy? Pregúntame sobre nuestros wax melts, diseños, pedidos o envíos.',
    },
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<FlatList>(null)

  // Reset session on tab focus (optional — keeps context alive)
  useFocusEffect(useCallback(() => {}, []))

  function scrollToBottom() {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
  }

  useEffect(() => { scrollToBottom() }, [messages])

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    Keyboard.dismiss()
    setLoading(true)

    try {
      const res = await chatApi.sendMessage(msg, sessionId)
      const reply = res.data?.reply ?? res.data?.content ?? 'Lo siento, no entendí tu mensaje.'
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Ups, tuve un problema para responder. Inténtalo de nuevo 🌸' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === 'user'
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>🌸</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderMessage}
          ListFooterComponent={
            loading ? (
              <View style={styles.typingRow}>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarEmoji}>🌸</Text>
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={BRAND.tan} />
                  <Text style={styles.typingText}>Luna está escribiendo...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick prompts (only on first message) */}
        {messages.length === 1 && !loading && (
          <View style={styles.quickPrompts}>
            {QUICK_PROMPTS.map(q => (
              <TouchableOpacity
                key={q}
                style={styles.quickBtn}
                onPress={() => sendMessage(q)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickBtnText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pregúntale a Luna..."
            placeholderTextColor={BRAND.muted}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
            blurOnSubmit
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: BRAND.bg },
  list:             { padding: 16, gap: 12, paddingBottom: 8 },

  msgRow:           { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser:       { flexDirection: 'row-reverse' },

  avatarWrap:       { width: 32, height: 32, borderRadius: 16, backgroundColor: BRAND.cream, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarEmoji:      { fontSize: 16 },

  bubble:           { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAssistant:  { backgroundColor: BRAND.white, borderWidth: 1, borderColor: BRAND.tan + '40', borderBottomLeftRadius: 4 },
  bubbleUser:       { backgroundColor: BRAND.charcoal, borderBottomRightRadius: 4 },
  bubbleText:       { fontSize: 14, color: BRAND.charcoal, lineHeight: 20 },
  bubbleTextUser:   { color: BRAND.white },

  typingRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  typingBubble:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: BRAND.white, borderWidth: 1, borderColor: BRAND.tan + '40', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  typingText:       { fontSize: 13, color: BRAND.muted, fontStyle: 'italic' },

  quickPrompts:     { paddingHorizontal: 16, paddingBottom: 8, gap: 8, flexDirection: 'row', flexWrap: 'wrap' },
  quickBtn:         { backgroundColor: BRAND.white, borderWidth: 1, borderColor: BRAND.tan, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  quickBtnText:     { fontSize: 13, color: BRAND.charcoal },

  inputBar:         { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, paddingBottom: Platform.OS === 'ios' ? 8 : 12, backgroundColor: BRAND.white, borderTopWidth: 1, borderTopColor: BRAND.tan + '40' },
  input:            { flex: 1, borderWidth: 1.5, borderColor: BRAND.tan, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: BRAND.charcoal, maxHeight: 100, backgroundColor: BRAND.bg },
  sendBtn:          { width: 44, height: 44, borderRadius: 22, backgroundColor: BRAND.charcoal, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:  { backgroundColor: BRAND.tan },
  sendBtnText:      { color: BRAND.white, fontSize: 18, fontWeight: '700' },
})
