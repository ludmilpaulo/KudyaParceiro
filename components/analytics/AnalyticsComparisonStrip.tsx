import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatPercentChange, type AnalyticsMetricComparison } from "../../utils/analyticsExport";

export type ComparisonCard = {
  key: string;
  label: string;
  comparison: AnalyticsMetricComparison;
  formatValue?: (value: number) => string;
};

type Props = {
  title: string;
  vsPreviousLabel: string;
  cards: ComparisonCard[];
};

export default function AnalyticsComparisonStrip({ title, vsPreviousLabel, cards }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{vsPreviousLabel}</Text>
      <View style={styles.grid}>
        {cards.map((card) => {
          const format = card.formatValue ?? ((value: number) => String(value));
          const pct = card.comparison.percentChange;
          const up = (pct ?? 0) > 0;
          const down = (pct ?? 0) < 0;
          return (
            <View key={card.key} style={styles.card}>
              <Text style={styles.label}>{card.label}</Text>
              <Text style={styles.value}>{format(card.comparison.current)}</Text>
              <Text style={styles.prev}>Prev: {format(card.comparison.previous)}</Text>
              <Text style={[styles.pct, up && styles.up, down && styles.down]}>
                {formatPercentChange(pct)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  title: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  hint: { marginTop: 2, marginBottom: 8, fontSize: 12, color: "#64748b" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  label: { fontSize: 11, fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  value: { marginTop: 4, fontSize: 22, fontWeight: "800", color: "#0f172a" },
  prev: { marginTop: 2, fontSize: 11, color: "#94a3b8" },
  pct: { marginTop: 6, fontSize: 13, fontWeight: "700", color: "#64748b" },
  up: { color: "#047857" },
  down: { color: "#be123c" },
});
