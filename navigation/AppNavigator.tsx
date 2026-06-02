// navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import AuthNavigator from "./AuthNavigator";
import HomeNavigator from "./HomeNavigator";
import RestaurantDrawer from "./RestaurantDrawer";
import { LogBox } from "react-native";

import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../services/types";

LogBox.ignoreLogs(["new NativeEventEmitter"]);

const Stack = createStackNavigator<RootStackParamList>();

import { canUsePartnerApp } from '../utils/partnerRoles';

export default function AppNavigator() {
  const user = useSelector(selectUser);

  const showDriver = Boolean(user?.is_driver);
  const showPartner = Boolean(user && canUsePartnerApp(user));

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user && showDriver ? (
          <Stack.Screen name="HomeNavigator" component={HomeNavigator} />
        ) : user && showPartner ? (
          <Stack.Screen name="RestaurantDrawer" component={RestaurantDrawer} />
        ) : (
          <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
