import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DriverDashboardScreen from "../screens/driver/DriverDashboardScreen";
import EntregadorDashboard from "../screens/EntregadorDashboard";
import CustomerDelivery from "../screens/CustomerDelivery";
import RestaurantMap from "../screens/RestaurantMap";
import AccountScreen from "../screens/AccountScreen";
import DriverDocumentsScreen from "../screens/driver/DriverDocumentsScreen";
import DriverVerificationScreen from "../screens/driver/DriverVerificationScreen";
import DriverVehicleScreen from "../screens/driver/DriverVehicleScreen";
import DriverTasksScreen from "../screens/DriverTasksScreen";
import type { DriverShellStackParamList } from "../types/driverDashboard";
import { withDriverShellTab } from "./withDriverShellTab";

export type { DriverShellStackParamList } from "../types/driverDashboard";

const Stack = createNativeStackNavigator<DriverShellStackParamList>();

const FoodDeliveriesScreen = withDriverShellTab(EntregadorDashboard, "Food");
const ParcelDeliveriesScreen = withDriverShellTab(CustomerDelivery, "Parcels");
const AccountShellScreen = withDriverShellTab(AccountScreen, "Account");

export default function DriverShellNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="DriverDashboard">
      <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
      <Stack.Screen name="FoodDeliveries" component={FoodDeliveriesScreen} />
      <Stack.Screen name="ParcelDeliveries" component={ParcelDeliveriesScreen} />
      <Stack.Screen name="ActiveTripMap" component={RestaurantMap} />
      <Stack.Screen name="Account" component={AccountShellScreen} />
      <Stack.Screen name="DriverDocuments" component={DriverDocumentsScreen} />
      <Stack.Screen name="DriverVerification" component={DriverVerificationScreen} />
      <Stack.Screen name="DriverVehicle" component={DriverVehicleScreen} />
      <Stack.Screen name="DriverTasks" component={DriverTasksScreen} />
    </Stack.Navigator>
  );
}
