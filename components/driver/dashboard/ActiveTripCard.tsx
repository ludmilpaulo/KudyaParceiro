import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { cardShadow, driverDashboardColors, radius, spacing } from "../../../theme/driverDashboardTokens";
import type { DriverDashboardActiveTrip } from "../../../types/driverDashboard";

type Props = {
  trip: DriverDashboardActiveTrip | null;
  currency: string;
  onTripAction?: (trip: DriverDashboardActiveTrip) => void;
};

function ctaLabel(status: DriverDashboardActiveTrip["status"]): string {
  if (status === "assigned") return "Go to pickup";
  if (status === "arrived") return "Start trip";
  if (status === "in_progress") return "Go to drop-off";
  return "View trip";
}

export default function ActiveTripCard({ trip, currency, onTripAction }: Props) {
  if (!trip) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Active Trip</Text>
        <View style={styles.emptyBox}>
          <Ionicons name="navigate-outline" size={28} color={driverDashboardColors.primary} />
          <Text style={styles.emptyTitle}>No active trip right now</Text>
          <Text style={styles.emptySub}>Stay online to receive new ride, food, or parcel requests.</Text>
        </View>
      </View>
    );
  }

  const hasCoords =
    trip.pickupLatitude !== 0 &&
    trip.pickupLongitude !== 0 &&
    trip.dropoffLatitude !== 0 &&
    trip.dropoffLongitude !== 0;

  const region = hasCoords
    ? {
        latitude: (trip.pickupLatitude + trip.dropoffLatitude) / 2,
        longitude: (trip.pickupLongitude + trip.dropoffLongitude) / 2,
        latitudeDelta: Math.max(0.04, Math.abs(trip.pickupLatitude - trip.dropoffLatitude) * 1.8),
        longitudeDelta: Math.max(0.04, Math.abs(trip.pickupLongitude - trip.dropoffLongitude) * 1.8),
      }
    : {
        latitude: -1.2864,
        longitude: 36.8172,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Active Trip</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>In Progress</Text>
        </View>
      </View>

      <View style={styles.split}>
        <View style={styles.details}>
          <View style={styles.stopRow}>
            <View style={[styles.stopDot, { backgroundColor: driverDashboardColors.primary }]} />
            <View style={styles.stopText}>
              <Text style={styles.stopLabel}>Pickup</Text>
              <Text style={styles.stopName}>{trip.pickupName}</Text>
              <Text style={styles.stopAddress}>{trip.pickupAddress}</Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.stopRow}>
            <View style={[styles.stopDot, { backgroundColor: driverDashboardColors.success }]} />
            <View style={styles.stopText}>
              <Text style={styles.stopLabel}>Drop-off</Text>
              <Text style={styles.stopName}>{trip.dropoffName}</Text>
              <Text style={styles.stopAddress}>{trip.dropoffAddress}</Text>
            </View>
          </View>

          <View style={styles.etaRow}>
            <Ionicons name="time-outline" size={16} color={driverDashboardColors.textSecondary} />
            <Text style={styles.etaLabel}>ETA</Text>
            <Text style={styles.etaValue}>{trip.etaMinutes} min</Text>
            <Text style={styles.etaDistance}>({trip.distanceKm} km)</Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={() => onTripAction?.(trip)}>
            <LinearGradient colors={["#0077E6", "#004FB8"]} style={styles.cta}>
              <Text style={styles.ctaText}>{ctaLabel(trip.status)}</Text>
              <View style={styles.ctaIcon}>
                <Ionicons name="arrow-forward" size={18} color={driverDashboardColors.primary} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            initialRegion={region}
          >
            {hasCoords ? (
              <>
                <Polyline
                  coordinates={[
                    { latitude: trip.pickupLatitude, longitude: trip.pickupLongitude },
                    { latitude: trip.dropoffLatitude, longitude: trip.dropoffLongitude },
                  ]}
                  strokeColor={driverDashboardColors.primary}
                  strokeWidth={3}
                />
                <Marker
                  coordinate={{ latitude: trip.pickupLatitude, longitude: trip.pickupLongitude }}
                  pinColor={driverDashboardColors.primary}
                />
                <Marker
                  coordinate={{ latitude: trip.dropoffLatitude, longitude: trip.dropoffLongitude }}
                  pinColor={driverDashboardColors.success}
                />
              </>
            ) : null}
          </MapView>
          <TouchableOpacity style={styles.compassBtn} activeOpacity={0.8}>
            <Ionicons name="locate" size={18} color={driverDashboardColors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const cardWidth = Dimensions.get("window").width - spacing.lg * 2;

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
  title: { fontSize: 18, fontWeight: "800", color: driverDashboardColors.textPrimary },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: driverDashboardColors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: driverDashboardColors.primary },
  statusText: { fontSize: 12, fontWeight: "700", color: driverDashboardColors.primary },
  split: { flexDirection: "column", gap: spacing.md },
  details: { gap: spacing.sm },
  stopRow: { flexDirection: "row", gap: spacing.sm },
  stopDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  stopText: { flex: 1 },
  stopLabel: { fontSize: 11, color: driverDashboardColors.textMuted, fontWeight: "600" },
  stopName: { fontSize: 15, fontWeight: "700", color: driverDashboardColors.textPrimary },
  stopAddress: { fontSize: 12, color: driverDashboardColors.textSecondary, marginTop: 2 },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: driverDashboardColors.border,
    marginLeft: 4,
    borderStyle: "dashed",
  },
  etaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  etaLabel: { fontSize: 13, color: driverDashboardColors.textSecondary },
  etaValue: { fontSize: 14, fontWeight: "800", color: driverDashboardColors.textPrimary },
  etaDistance: { fontSize: 12, color: driverDashboardColors.textMuted },
  cta: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  ctaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mapWrap: {
    height: 160,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: driverDashboardColors.border,
  },
  map: { width: cardWidth - spacing.lg * 2, height: 160 },
  compassBtn: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    ...cardShadow,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: driverDashboardColors.textPrimary },
  emptySub: { fontSize: 13, color: driverDashboardColors.textSecondary, textAlign: "center", paddingHorizontal: spacing.lg },
});
