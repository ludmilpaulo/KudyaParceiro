import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('KudyaParceiro crash:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>Algo correu mal</Text>
          <Text style={styles.body}>
            Reinicie a aplicação. Se o problema continuar, verifique a ligação à internet e tente
            novamente.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#0171CE', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
