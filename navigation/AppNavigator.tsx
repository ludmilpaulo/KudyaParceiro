// navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import AuthNavigator from "./AuthNavigator";
import HomeNavigator from "./HomeNavigator";
import PartnerNavigator from "./PartnerNavigator";
import { LogBox, Platform, StyleSheet, View } from "react-native";

import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../services/types";

LogBox.ignoreLogs(["new NativeEventEmitter"]);

const Stack = createStackNavigator<RootStackParamList>();

import { canUsePartnerApp, canUseRiderApp } from '../utils/partnerRoles';

export default function AppNavigator() {
  const user = useSelector(selectUser);

  const showRider = Boolean(user && canUseRiderApp(user));
  const showPartner = Boolean(user && canUsePartnerApp(user));
  const navKey = showRider ? 'rider' : showPartner ? 'partner' : 'auth';

  return (
    <View style={styles.root}>
      <NavigationContainer key={navKey}>
        <Stack.Navigator
          key={navKey}
          screenOptions={{ headerShown: false, cardStyle: styles.card }}
        >
          {showRider ? (
            <Stack.Screen name="HomeNavigator" component={HomeNavigator} />
          ) : showPartner ? (
            <Stack.Screen name="RestaurantDrawer" component={PartnerNavigator} />
          ) : (
            <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    ...(Platform.OS === 'web' ? { minHeight: 0 } : null),
  },
  card: {
    flex: 1,
  },
});
