import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { driverDashboardColors, radius, spacing } from "../../../theme/driverDashboardTokens";

type ActionItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bg: string;
  onPress?: () => void;
};

type Props = {
  showFood?: boolean;
  showParcels?: boolean;
  showTaxi?: boolean;
  onFoodPress?: () => void;
  onParcelsPress?: () => void;
  onTaxiPress?: () => void;
  onNavigatePress?: () => void;
  onSupportPress?: () => void;
};

function QuickActionCard({ title, subtitle, icon, bg, onPress }: Omit<ActionItem, "key">) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: bg }]} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function QuickActionsSection({
  showFood = true,
  showParcels = true,
  showTaxi = false,
  onFoodPress,
  onParcelsPress,
  onTaxiPress,
  onNavigatePress,
  onSupportPress,
}: Props) {
  const cards: Omit<ActionItem, "key">[] = [];
  if (showFood) {
    cards.push({
      title: "Food",
      subtitle: "Deliveries",
      icon: <MaterialCommunityIcons name="food" size={22} color={driverDashboardColors.primary} />,
      bg: driverDashboardColors.primaryLight,
      onPress: onFoodPress,
    });
  }
  if (showParcels) {
    cards.push({
      title: "Parcels",
      subtitle: "Deliveries",
      icon: <Ionicons name="cube-outline" size={22} color={driverDashboardColors.success} />,
      bg: driverDashboardColors.successLight,
      onPress: onParcelsPress,
    });
  }
  if (showTaxi) {
    cards.push({
      title: "Taxi",
      subtitle: "Ride offers",
      icon: <Ionicons name="car-sport" size={22} color={driverDashboardColors.purple} />,
      bg: driverDashboardColors.purpleLight,
      onPress: onTaxiPress,
    });
  }
  cards.push(
    {
      title: "Navigate",
      subtitle: "Find locations",
      icon: <Ionicons name="navigate" size={22} color={driverDashboardColors.purple} />,
      bg: driverDashboardColors.purpleLight,
      onPress: onNavigatePress,
    },
    {
      title: "Support",
      subtitle: "Get help",
      icon: <Ionicons name="headset-outline" size={22} color={driverDashboardColors.warning} />,
      bg: driverDashboardColors.warningLight,
      onPress: onSupportPress,
    },
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {cards.map((card) => (
          <QuickActionCard key={card.title} {...card} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: driverDashboardColors.textPrimary },
  seeAll: { fontSize: 13, fontWeight: "700", color: driverDashboardColors.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    width: "47%",
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 110,
  },
  iconWrap: { marginBottom: spacing.sm },
  title: { fontSize: 16, fontWeight: "800", color: driverDashboardColors.textPrimary },
  subtitle: { fontSize: 12, color: driverDashboardColors.textSecondary, marginTop: 2 },
});
