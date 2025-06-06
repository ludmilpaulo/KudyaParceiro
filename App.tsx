import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { TailwindProvider } from "tailwindcss-react-native";
import { store, persistor } from "./redux/store"; // Ensure correct import path
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./navigation/AppNavigator";




export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <TailwindProvider>
          <PersistGate loading={null} persistor={persistor}>
         <AppNavigator />
          </PersistGate>
        </TailwindProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}