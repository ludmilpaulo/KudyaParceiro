import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, StyleSheet } from "react-native";
import { Provider } from "react-redux";
import { TailwindProvider } from "tailwindcss-react-native";
import { store, persistor } from "./redux/store"; // Ensure correct import path
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./navigation/AppNavigator";
import ErrorBoundary from "./components/ErrorBoundary";
import { analytics } from "./utils/mixpanel";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SafeAreaProvider } from "react-native-safe-area-context";




export default function App() {
  useEffect(() => {
    analytics.track('App Opened');
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        html, body, #root { height: 100%; margin: 0; }
        body { overflow: auto; -webkit-overflow-scrolling: touch; }
        #root { display: flex; flex-direction: column; min-height: 100%; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <Provider store={store}>
            <TailwindProvider>
              <PersistGate loading={null} persistor={persistor}>
                <LanguageProvider>
                  <AppNavigator />
                </LanguageProvider>
              </PersistGate>
            </TailwindProvider>
          </Provider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});