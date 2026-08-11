import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type AnalyticsDays = 7 | 30 | 90;

const OPTIONS: AnalyticsDays[] = [7, 30, 90];

type Props = {
  value: AnalyticsDays;
  onChange: (days: AnalyticsDays) => void;
  labelFor: (days: AnalyticsDays) => string;
};

export default function AnalyticsDaysFilter({ value, onChange, labelFor }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((days) => {
        const active = value === days;
        return (
          <Pressable
            key={days}
            onPress={() => onChange(days)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{labelFor(days)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: "#0f766e", borderColor: "#0f766e" },
  chipText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  chipTextActive: { color: "#fff" },
});
