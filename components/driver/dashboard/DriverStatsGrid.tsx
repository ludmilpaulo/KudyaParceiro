import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { driverDashboardColors, spacing } from "../../../theme/driverDashboardTokens";
import type { DriverDashboardSummary } from "../../../types/driverDashboard";
import StatCard from "./StatCard";

type Props = {
  summary: DriverDashboardSummary;
  onWalletPress?: () => void;
  onOrdersPress?: () => void;
  onHoursPress?: () => void;
};

function formatMoney(amount: number, currency: string): string {
  const symbol = currency === "ZAR" ? "R" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${amount.toFixed(2)}`;
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function DriverStatsGrid({ summary, onWalletPress, onOrdersPress, onHoursPress }: Props) {
  const acceptanceFooter =
    summary.acceptanceRate >= 85 ? "Great job!" : summary.acceptanceRate >= 70 ? "Keep it up" : "Improve acceptance";

  return (
    <View style={styles.grid}>
      <StatCard
        icon={<Ionicons name="wallet-outline" size={20} color={driverDashboardColors.primary} />}
        iconBg={driverDashboardColors.primaryLight}
        label="Wallet Balance"
        value={formatMoney(summary.walletBalance, summary.currency)}
        actionLabel="View wallet"
        onPress={onWalletPress}
      />
      <StatCard
        icon={<MaterialCommunityIcons name="shopping" size={20} color={driverDashboardColors.success} />}
        iconBg={driverDashboardColors.successLight}
        label="Orders Today"
        value={String(summary.ordersToday)}
        actionLabel="View details"
        onPress={onOrdersPress}
      />
      <StatCard
        icon={<Ionicons name="shield-checkmark-outline" size={20} color={driverDashboardColors.primary} />}
        iconBg={driverDashboardColors.primaryLight}
        label="Acceptance Rate"
        value={`${summary.acceptanceRate.toFixed(0)}%`}
        footer={acceptanceFooter}
      />
      <StatCard
        icon={<Ionicons name="time-outline" size={20} color={driverDashboardColors.purple} />}
        iconBg={driverDashboardColors.purpleLight}
        label="Hours Online"
        value={formatHours(summary.hoursOnlineMinutes)}
        actionLabel="View summary"
        onPress={onHoursPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
});
