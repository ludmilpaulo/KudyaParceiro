import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cardShadow, driverDashboardColors, radius, spacing } from "../../../theme/driverDashboardTokens";
import type { DriverAccountStatus } from "../../../types/driverDashboard";

type Props = {
  status: DriverAccountStatus;
  onPress?: () => void;
};

function contentForStatus(status: DriverAccountStatus) {
  switch (status) {
    case "approved":
      return {
        badge: "Approved",
        badgeBg: driverDashboardColors.successLight,
        badgeColor: driverDashboardColors.success,
        boxBg: driverDashboardColors.successLight,
        title: "You're all set!",
        subtitle: "Your account is active and in good standing.",
        action: "View account details",
      };
    case "pending_verification":
      return {
        badge: "Pending",
        badgeBg: driverDashboardColors.warningLight,
        badgeColor: driverDashboardColors.warning,
        boxBg: driverDashboardColors.warningLight,
        title: "Under review",
        subtitle: "Your account is under review.",
        action: "View verification status",
      };
    case "rejected":
      return {
        badge: "Rejected",
        badgeBg: driverDashboardColors.dangerLight,
        badgeColor: driverDashboardColors.danger,
        boxBg: driverDashboardColors.dangerLight,
        title: "Needs attention",
        subtitle: "Your application needs attention.",
        action: "Review feedback",
      };
    case "suspended":
      return {
        badge: "Suspended",
        badgeBg: driverDashboardColors.dangerLight,
        badgeColor: driverDashboardColors.danger,
        boxBg: driverDashboardColors.dangerLight,
        title: "Account suspended",
        subtitle: "Your account is temporarily suspended.",
        action: "Contact support",
      };
    case "expired_documents":
      return {
        badge: "Expired Documents",
        badgeBg: driverDashboardColors.dangerLight,
        badgeColor: driverDashboardColors.danger,
        boxBg: driverDashboardColors.dangerLight,
        title: "Documents expired",
        subtitle: "Please update your expired documents.",
        action: "Upload documents",
      };
    default:
      return {
        badge: "Draft",
        badgeBg: driverDashboardColors.primaryLight,
        badgeColor: driverDashboardColors.primary,
        boxBg: driverDashboardColors.primaryLight,
        title: "Complete your profile",
        subtitle: "Finish onboarding to start earning.",
        action: "Continue setup",
      };
  }
}

export default function AccountStatusCard({ status, onPress }: Props) {
  const copy = contentForStatus(status);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Account Status</Text>
        <View style={[styles.badge, { backgroundColor: copy.badgeBg }]}>
          <Text style={[styles.badgeText, { color: copy.badgeColor }]}>{copy.badge}</Text>
        </View>
      </View>

      <View style={[styles.box, { backgroundColor: copy.boxBg }]}>
        <Ionicons
          name={status === "approved" ? "checkmark-circle" : "information-circle-outline"}
          size={22}
          color={copy.badgeColor}
        />
        <View style={styles.boxText}>
          <Text style={styles.boxTitle}>{copy.title}</Text>
          <Text style={styles.boxSub}>{copy.subtitle}</Text>
        </View>
      </View>

      <Text style={styles.action}>{copy.action}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: driverDashboardColors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    ...cardShadow,
  },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  title: { fontSize: 17, fontWeight: "800", color: driverDashboardColors.textPrimary },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  badgeText: { fontSize: 11, fontWeight: "700" },
  box: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "flex-start",
  },
  boxText: { flex: 1 },
  boxTitle: { fontSize: 15, fontWeight: "800", color: driverDashboardColors.textPrimary },
  boxSub: { fontSize: 13, color: driverDashboardColors.textSecondary, marginTop: 4, lineHeight: 18 },
  action: { marginTop: spacing.md, fontSize: 13, fontWeight: "700", color: driverDashboardColors.primary },
});
