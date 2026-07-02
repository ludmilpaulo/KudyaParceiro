import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { driverDashboardColors, headerGradient, spacing } from "../../../theme/driverDashboardTokens";
import { Image } from "expo-image";
import OnlineStatusToggle from "./OnlineStatusToggle";

type Props = {
  driverName: string;
  avatarUrl: string | null;
  isOnline: boolean;
  unreadCount: number;
  togglingOnline: boolean;
  onToggleOnline: (value: boolean) => void;
  onNotificationsPress?: () => void;
};

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DriverHeader({
  driverName,
  avatarUrl,
  isOnline,
  unreadCount,
  togglingOnline,
  onToggleOnline,
  onNotificationsPress,
}: Props) {
  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);
  const subtitle = isOnline ? "You're online and ready to deliver." : "Go online to start receiving requests.";

  return (
    <LinearGradient colors={[...headerGradient]} style={styles.header}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.brand}>Kudya</Text>
          <Text style={styles.brandSub}>PARCEIRO</Text>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.bellWrap} onPress={onNotificationsPress} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="person" size={20} color={driverDashboardColors.primary} />
            </View>
          )}
        </View>
      </View>

      <Text style={styles.greeting}>
        {greeting}, {driverName.split(" ")[0] || "Driver"} 👋
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <OnlineStatusToggle
        isOnline={isOnline}
        disabled={togglingOnline}
        onToggle={onToggleOnline}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  brand: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },
  brandSub: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "700", letterSpacing: 2 },
  topRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  bellWrap: { padding: spacing.sm, position: "relative" },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: driverDashboardColors.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#fff" },
  avatarFallback: { backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  greeting: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: spacing.xs },
  subtitle: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: spacing.lg },
});
