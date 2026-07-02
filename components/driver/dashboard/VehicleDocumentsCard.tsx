import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { cardShadow, driverDashboardColors, radius, spacing } from "../../../theme/driverDashboardTokens";
import type { DriverDashboardVehicle } from "../../../types/driverDashboard";

type Props = {
  vehicle: DriverDashboardVehicle | null;
  onPress?: () => void;
};

function badgeForStatus(status: DriverDashboardVehicle["documentStatus"]) {
  switch (status) {
    case "verified":
      return { label: "Verified", bg: driverDashboardColors.successLight, color: driverDashboardColors.success };
    case "pending":
      return { label: "Pending Review", bg: driverDashboardColors.warningLight, color: driverDashboardColors.warning };
    case "rejected":
      return { label: "Rejected", bg: driverDashboardColors.dangerLight, color: driverDashboardColors.danger };
    case "expired":
      return { label: "Expired Documents", bg: driverDashboardColors.dangerLight, color: driverDashboardColors.danger };
    default:
      return { label: "Missing Documents", bg: driverDashboardColors.warningLight, color: driverDashboardColors.warning };
  }
}

function formatValidUntil(iso: string | null): string {
  if (!iso) return "No expiry on file";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `Valid until ${date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
}

export default function VehicleDocumentsCard({ vehicle, onPress }: Props) {
  if (!vehicle) {
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
        <Text style={styles.title}>Vehicle & Documents</Text>
        <Text style={styles.missing}>Add your vehicle and upload documents to get verified.</Text>
      </TouchableOpacity>
    );
  }

  const badge = badgeForStatus(vehicle.documentStatus);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Vehicle & Documents</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowIcon}>
          <MaterialCommunityIcons name="car" size={22} color={driverDashboardColors.primary} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{vehicle.plateNumber}</Text>
          <Text style={styles.rowSub}>{vehicle.vehicleName}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={driverDashboardColors.textMuted} />
      </View>

      <View style={[styles.row, styles.rowBorder]}>
        <View style={styles.rowIcon}>
          <Ionicons name="document-text-outline" size={22} color={driverDashboardColors.primary} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>All Documents</Text>
          <Text style={styles.rowSub}>{formatValidUntil(vehicle.validUntil)}</Text>
        </View>
      </View>
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
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  rowBorder: { borderTopWidth: 1, borderTopColor: driverDashboardColors.border, marginTop: spacing.sm },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: driverDashboardColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "700", color: driverDashboardColors.textPrimary },
  rowSub: { fontSize: 12, color: driverDashboardColors.textSecondary, marginTop: 2 },
  missing: { fontSize: 13, color: driverDashboardColors.textSecondary, lineHeight: 20 },
});
