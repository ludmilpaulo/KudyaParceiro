import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { cardShadow, driverDashboardColors, radius, spacing } from "../../../theme/driverDashboardTokens";
import type { DriverDashboardSummary } from "../../../types/driverDashboard";

type Props = {
  summary: DriverDashboardSummary;
  rating: number;
};

function formatMoney(amount: number, currency: string): string {
  const symbol = currency === "ZAR" ? "R" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${amount.toFixed(2)}`;
}

function SummaryColumn({
  label,
  value,
  footer,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  footer: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <View style={styles.column}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.colLabel}>{label}</Text>
      <Text style={styles.colValue}>{value}</Text>
      <Text style={styles.colFooter}>{footer}</Text>
    </View>
  );
}

export default function DriverSummaryCard({ summary, rating }: Props) {
  const earningsFooter =
    summary.todayEarningsChangePercent >= 0
      ? `↗ +${summary.todayEarningsChangePercent.toFixed(0)}% vs yesterday`
      : `↘ ${summary.todayEarningsChangePercent.toFixed(0)}% vs yesterday`;
  const tripsFooter =
    summary.completedTripsChange >= 0
      ? `↗ +${summary.completedTripsChange} vs yesterday`
      : `↘ ${summary.completedTripsChange} vs yesterday`;
  const ratingLabel = rating >= 4.8 ? "Excellent" : rating >= 4.5 ? "Great" : "Good";

  return (
    <View style={styles.card}>
      <SummaryColumn
        label="Today's Earnings"
        value={formatMoney(summary.todayEarnings, summary.currency)}
        footer={earningsFooter}
        icon={<Ionicons name="wallet-outline" size={18} color={driverDashboardColors.primary} />}
        iconBg={driverDashboardColors.primaryLight}
      />
      <View style={styles.divider} />
      <SummaryColumn
        label="Completed Trips"
        value={String(summary.completedTripsToday)}
        footer={tripsFooter}
        icon={<MaterialCommunityIcons name="bag-checked" size={18} color={driverDashboardColors.success} />}
        iconBg={driverDashboardColors.successLight}
      />
      <View style={styles.divider} />
      <SummaryColumn
        label="Your Rating"
        value={rating > 0 ? rating.toFixed(1) : "—"}
        footer={ratingLabel}
        icon={<Ionicons name="star" size={18} color={driverDashboardColors.warning} />}
        iconBg={driverDashboardColors.warningLight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: driverDashboardColors.card,
    borderRadius: radius.xl,
    marginHorizontal: spacing.lg,
    marginTop: -28,
    padding: spacing.lg + 4,
    ...cardShadow,
  },
  column: { flex: 1, alignItems: "center" },
  divider: { width: 1, backgroundColor: driverDashboardColors.border, marginVertical: spacing.xs },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  colLabel: { fontSize: 11, color: driverDashboardColors.textSecondary, textAlign: "center" },
  colValue: { fontSize: 18, fontWeight: "800", color: driverDashboardColors.textPrimary, marginTop: 2 },
  colFooter: { fontSize: 10, color: driverDashboardColors.textMuted, marginTop: spacing.xs, textAlign: "center" },
});
