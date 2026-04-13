import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'

interface State { hasError: boolean; error: string }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error?.message ?? String(error) }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo salió mal 😕</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.error}>{this.state.error}</Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.setState({ hasError: false, error: '' })}
          >
            <Text style={styles.btnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F7F3EF' },
  title:     { fontSize: 20, fontWeight: '700', color: '#4F5353', marginBottom: 16 },
  scroll:    { maxHeight: 200, width: '100%', marginBottom: 24 },
  error:     { fontSize: 12, color: '#C0392B', fontFamily: 'monospace', lineHeight: 18 },
  btn:       { backgroundColor: '#4F5353', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  btnText:   { color: '#FFF', fontWeight: '600', fontSize: 15 },
})
