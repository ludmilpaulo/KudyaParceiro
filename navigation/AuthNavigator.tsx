import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Platform, StyleSheet } from "react-native";

import JoinScreen from "../screens/JoinScreen";
import SignupScreen from "../screens/SignupScreen";
import LoginScreenUser from "../screens/LoginScreenUser";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: styles.card,
      }}
    >
      <Stack.Screen name="Join" component={JoinScreen} />
      <Stack.Screen name="UserLogin" component={LoginScreenUser} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    ...(Platform.OS === 'web' ? { overflow: 'visible' as const } : null),
  },
});
