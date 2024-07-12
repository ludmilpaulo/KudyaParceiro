import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import RestaurantDashboard from "../screens/RestaurantDashboard";
import UserProfile from "../screens/UserProfile";
import EntregadorDashboard from "../screens/EntregadorDashboard";
import RestaurantMap from "../screens/RestaurantMap";
import CustomerDelivery from '../screens/CustomerDelivery';
import MainTabNavigator from "./MainTabNavigator";


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
     <Stack.Screen name="HomeScreen" component={MainTabNavigator} />
      <Stack.Screen name="EntregadorDashboard" component={EntregadorDashboard} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="RestaurantMap" component={RestaurantMap} />
      <Stack.Screen name="RestaurantDashboard" component={RestaurantDashboard} />
      <Stack.Screen name="CustomerDelivery" component={CustomerDelivery} />
    </Stack.Navigator>
  );
}