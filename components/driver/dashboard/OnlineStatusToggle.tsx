import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { driverDashboardColors, radius, spacing } from "../../../theme/driverDashboardTokens";

type Props = {
  isOnline: boolean;
  disabled?: boolean;
  onToggle: (value: boolean) => void;
};

export default function OnlineStatusToggle({ isOnline, disabled, onToggle }: Props) {
  return (
    <View style={styles.pill}>
      <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      <Text style={styles.label}>{isOnline ? "Online" : "Offline"}</Text>
      <Switch
        value={isOnline}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: "#CBD5E1", true: driverDashboardColors.success }}
        thumbColor="#fff"
        ios_backgroundColor="#CBD5E1"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOnline: { backgroundColor: driverDashboardColors.success },
  dotOffline: { backgroundColor: driverDashboardColors.textMuted },
  label: { color: driverDashboardColors.textPrimary, fontWeight: "700", fontSize: 14, minWidth: 52 },
});
