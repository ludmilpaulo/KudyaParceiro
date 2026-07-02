import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DriverShellNavigator from "./DriverShellNavigator";
import UserProfile from "../screens/UserProfile";
import DriverVerificationScreen from "../screens/driver/DriverVerificationScreen";
import DriverDocumentsScreen from "../screens/driver/DriverDocumentsScreen";
import DriverVehicleScreen from "../screens/driver/DriverVehicleScreen";
import { useGetDriverVerificationStatusQuery } from "../redux/slices/driverApi";

const Stack = createStackNavigator();

function DriverWorkTabs() {
  const { data: verification } = useGetDriverVerificationStatusQuery(undefined, {
    pollingInterval: 60000,
  });
  const canOperate = Boolean(verification?.canOperate);

  if (!canOperate) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: true, headerStyle: { backgroundColor: "#0171CE" }, headerTintColor: "#fff" }}>
        <Stack.Screen name="DriverVerification" component={DriverVerificationScreen} options={{ title: "Verification" }} />
        <Stack.Screen name="DriverDocuments" component={DriverDocumentsScreen} options={{ title: "Documents" }} />
        <Stack.Screen name="DriverVehicle" component={DriverVehicleScreen} options={{ title: "Vehicle" }} />
        <Stack.Screen name="UserProfile" component={UserProfile} options={{ title: "Complete profile" }} />
      </Stack.Navigator>
    );
  }

  return <DriverShellNavigator />;
}

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EntregadorDashboard" component={DriverWorkTabs} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
    </Stack.Navigator>
  );
}