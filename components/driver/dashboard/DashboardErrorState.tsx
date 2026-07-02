import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { driverDashboardColors, radius, spacing } from "../../../theme/driverDashboardTokens";

type Props = {
  onRetry: () => void;
};

export default function DashboardErrorState({ onRetry }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>We couldn't load your dashboard</Text>
      <Text style={styles.subtitle}>Please check your connection and try again.</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: driverDashboardColors.background,
  },
  title: { fontSize: 18, fontWeight: "800", color: driverDashboardColors.textPrimary, textAlign: "center" },
  subtitle: {
    fontSize: 14,
    color: driverDashboardColors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: driverDashboardColors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
