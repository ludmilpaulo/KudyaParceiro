import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import RestaurantDashboard from "../screens/RestaurantDashboard";
import HomeScreen from "../screens/HomeScreen";

const Stack = createStackNavigator();

export default function HomeNavigator() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="RestaurantDashboard" component={RestaurantDashboard} />
    </Stack.Navigator>
  );
}