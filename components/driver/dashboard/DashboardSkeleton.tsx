import React from "react";
import { View, StyleSheet } from "react-native";
import { driverDashboardColors, radius, spacing } from "../../../theme/driverDashboardTokens";

function Block({ height, style }: { height: number; style?: object }) {
  return <View style={[styles.block, { height }, style]} />;
}

export default function DashboardSkeleton() {
  return (
    <View style={styles.wrap}>
      <Block height={180} style={styles.header} />
      <Block height={120} style={styles.summary} />
      <Block height={280} />
      <View style={styles.grid}>
        <Block height={110} style={styles.half} />
        <Block height={110} style={styles.half} />
        <Block height={110} style={styles.half} />
        <Block height={110} style={styles.half} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: spacing.xxl, gap: spacing.lg },
  block: {
    backgroundColor: "#E8EEF5",
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    opacity: 0.7,
  },
  header: { marginHorizontal: 0, borderRadius: 0, opacity: 0.35 },
  summary: { marginTop: -20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  half: { width: "47%", marginHorizontal: 0 },
});
