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

export default function AppNavigator() {
  const user = useSelector(selectUser);

  let NavigatorComponent = AuthNavigator;
  if (user) {
    if (user.is_driver) {
      NavigatorComponent = HomeNavigator;
    } else if (!user.is_customer && !user.is_driver) {
      NavigatorComponent = RestaurantDrawer;
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.is_driver ? (
            <Stack.Screen name="HomeNavigator" component={HomeNavigator} />
          ) : (
            <Stack.Screen name="RestaurantDrawer" component={RestaurantDrawer} />
          )
        ) : (
          <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
