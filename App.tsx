import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { TailwindProvider } from "tailwindcss-react-native";
import { store, persistor } from "./redux/store"; // Ensure correct import path
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./navigation/AppNavigator";
import ErrorBoundary from "./components/ErrorBoundary";
import { analytics } from "./utils/mixpanel";
import { LanguageProvider } from "./contexts/LanguageContext";




export default function App() {
  useEffect(() => {
    // Initialize Mixpanel tracking
    analytics.track('App Opened');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}