import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { propertyTheme } from "./propertyUi";

type Props = {
  icon?: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
};

export default function PropertyEmptyState({
  icon = "home-outline",
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon as never} size={36} color={propertyTheme.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Pressable style={styles.btn} onPress={onAction}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.btnText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: propertyTheme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    borderStyle: "dashed",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: propertyTheme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: propertyTheme.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: propertyTheme.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  btn: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: propertyTheme.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
