import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { cardShadow, driverDashboardColors, radius, spacing } from "../../../theme/driverDashboardTokens";

type Props = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  footer?: string;
  actionLabel?: string;
  onPress?: () => void;
};

export default function StatCard({ icon, iconBg, label, value, footer, actionLabel, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "46%",
    backgroundColor: driverDashboardColors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...cardShadow,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  label: { fontSize: 12, color: driverDashboardColors.textSecondary, fontWeight: "600" },
  value: { fontSize: 20, fontWeight: "800", color: driverDashboardColors.textPrimary, marginTop: 2 },
  footer: { fontSize: 11, color: driverDashboardColors.success, marginTop: spacing.xs, fontWeight: "600" },
  action: { fontSize: 12, color: driverDashboardColors.primary, marginTop: spacing.sm, fontWeight: "700" },
});
