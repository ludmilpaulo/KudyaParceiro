import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { headerGradient, spacing } from "../../../theme/driverDashboardTokens";
import type { DriverShellTab } from "../../../types/driverDashboard";
import { useDriverCapabilities } from "../../../hooks/useDriverCapabilities";

type Props = {
  activeTab: DriverShellTab;
  onTabPress: (tab: DriverShellTab) => void;
};

type TabConfig = {
  key: DriverShellTab;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  visible?: boolean;
};

export default function DriverBottomNavigation({ activeTab, onTabPress }: Props) {
  const insets = useSafeAreaInsets();
  const { showFood, showParcel } = useDriverCapabilities();

  const tabs: TabConfig[] = [
    {
      key: "Food",
      label: "Food",
      visible: showFood,
      icon: (active) => (
        <MaterialCommunityIcons name="food" size={22} color={active ? "#0066D6" : "#fff"} />
      ),
    },
    {
      key: "Parcels",
      label: "Parcels",
      visible: showParcel,
      icon: (active) => <Ionicons name="cube-outline" size={22} color={active ? "#0066D6" : "#fff"} />,
    },
    {
      key: "Navigate",
      label: "Navigate",
      visible: true,
      icon: (active) => <Ionicons name="navigate" size={22} color={active ? "#0066D6" : "#fff"} />,
    },
    {
      key: "Account",
      label: "Account",
      visible: true,
      icon: (active) => <Ionicons name="person-outline" size={22} color={active ? "#0066D6" : "#fff"} />,
    },
  ];

  const visibleTabs = tabs.filter((tab) => tab.visible !== false);

  return (
    <LinearGradient
      colors={[...headerGradient]}
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
    >
      {visibleTabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.item}
            activeOpacity={0.85}
            onPress={() => onTabPress(tab.key)}
          >
            {active ? (
              <View style={styles.activeCircle}>{tab.icon(true)}</View>
            ) : (
              tab.icon(false)
            )}
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.md,
    minHeight: 84,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  activeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  label: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "600" },
  labelActive: { color: "#fff", fontWeight: "800" },
});
