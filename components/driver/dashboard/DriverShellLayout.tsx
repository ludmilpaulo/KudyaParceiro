import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DriverBottomNavigation from "./DriverBottomNavigation";
import { driverDashboardColors } from "../../../theme/driverDashboardTokens";
import type { DriverDashboardActiveTrip, DriverShellStackParamList, DriverShellTab } from "../../../types/driverDashboard";

type Props = {
  activeTab: DriverShellTab;
  children: React.ReactNode;
  showBottomNav?: boolean;
};

type Nav = NativeStackNavigationProp<DriverShellStackParamList>;

export default function DriverShellLayout({ activeTab, children, showBottomNav = true }: Props) {
  const navigation = useNavigation<Nav>();

  const navigateTab = (tab: DriverShellTab) => {
    if (tab === activeTab) {
      if (tab === "Navigate") {
        navigation.navigate("DriverDashboard");
      }
      return;
    }
    switch (tab) {
      case "Food":
        navigation.navigate("FoodDeliveries");
        break;
      case "Parcels":
        navigation.navigate("ParcelDeliveries");
        break;
      case "Navigate":
        navigation.navigate("DriverDashboard");
        break;
      case "Account":
        navigation.navigate("Account");
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.content}>{children}</View>
      {showBottomNav ? (
        <DriverBottomNavigation activeTab={activeTab} onTabPress={navigateTab} />
      ) : null}
    </View>
  );
}

export function navigateToActiveTripMap(
  navigation: NativeStackNavigationProp<DriverShellStackParamList>,
  trip?: DriverDashboardActiveTrip | null,
): void {
  navigation.navigate("ActiveTripMap", { trip: trip ?? undefined });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: driverDashboardColors.background },
  content: { flex: 1 },
});
