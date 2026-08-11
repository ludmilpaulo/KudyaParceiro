import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { propertyTheme } from "./propertyUi";

type Props = {
  icon: string;
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
  onPress?: () => void;
};

export default function PropertyKpiCard({
  icon,
  label,
  value,
  hint,
  accent = propertyTheme.primary,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon as never} size={20} color={accent} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 148,
    flexGrow: 1,
    backgroundColor: propertyTheme.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: { opacity: 0.9 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: propertyTheme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "800",
    color: propertyTheme.text,
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    color: propertyTheme.textSecondary,
  },
});
