import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import { fetchPartnerStayBookings } from "../../services/stayBookingApi";
import type { PartnerStayBooking, PartnerStayBookingsResponse } from "../../types/property";
import { propertyTheme } from "../../components/property/propertyUi";

const emptyStats: PartnerStayBookingsResponse["stats"] = {
  today: 0,
  upcoming: 0,
  thisMonth: 0,
};

export default function PropertyStayBookingsScreen() {
  const { pt } = usePropertyTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState(emptyStats);
  const [bookings, setBookings] = useState<PartnerStayBooking[]>([]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const data = await fetchPartnerStayBookings();
      setStats(data.stats);
      setBookings(data.results);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={propertyTheme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{pt("stayBookingsLoadError")}</Text>
        <Pressable style={styles.retryBtn} onPress={() => void load()}>
          <Text style={styles.retryText}>{pt("tryAgain")}</Text>
        </Pressable>
      </View>
    );
  }

  const kpis: {
    key: keyof typeof stats;
    label: string;
    icon: "today-outline" | "calendar-outline" | "stats-chart-outline";
  }[] = [
    { key: "today", label: pt("stayBookingsToday"), icon: "today-outline" },
    { key: "upcoming", label: pt("stayBookingsUpcoming"), icon: "calendar-outline" },
    { key: "thisMonth", label: pt("stayBookingsThisMonth"), icon: "stats-chart-outline" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void load(true)}
          tintColor={propertyTheme.primary}
        />
      }
    >
      <Text style={styles.title}>{pt("stayBookings")}</Text>
      <Text style={styles.subtitle}>{pt("stayBookingsSubtitle")}</Text>

      <View style={styles.kpiRow}>
        {kpis.map((item) => (
          <View key={item.key} style={styles.kpiCard}>
            <Ionicons name={item.icon} size={18} color={propertyTheme.primary} />
            <Text style={styles.kpiValue}>{stats[item.key]}</Text>
            <Text style={styles.kpiLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {bookings.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bed-outline" size={32} color={propertyTheme.primary} />
          </View>
          <Text style={styles.emptyTitle}>{pt("emptyStayBookingsTitle")}</Text>
          <Text style={styles.emptySubtitle}>{pt("emptyStayBookingsSubtitle")}</Text>
        </View>
      ) : (
        bookings.map((booking) => (
          <View key={booking.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardHead}>
                <Text style={styles.propertyTitle} numberOfLines={1}>
                  {booking.propertyTitle}
                </Text>
                <Text style={styles.meta}>
                  {booking.guestName || "—"} · {booking.bookingCode}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{booking.status.replaceAll("_", " ")}</Text>
              </View>
            </View>
            <Text style={styles.dates}>
              {booking.checkIn} → {booking.checkOut} · {booking.nights} {pt("stayNights")}
            </Text>
            <Text style={styles.guests}>
              {booking.adults} {pt("stayAdults")}
              {booking.children > 0 ? ` · ${booking.children} ${pt("stayChildren")}` : ""}
            </Text>
            <Text style={styles.total}>
              {booking.currency} {booking.totalAmount}
            </Text>
            {booking.guestNotes ? (
              <Text style={styles.notes} numberOfLines={3}>
                {booking.guestNotes}
              </Text>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: propertyTheme.background },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  error: { color: propertyTheme.danger, textAlign: "center", marginBottom: 12 },
  retryBtn: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  title: { fontSize: 28, fontWeight: "800", color: propertyTheme.text },
  subtitle: { marginTop: 4, marginBottom: 16, color: propertyTheme.textMuted, fontSize: 14 },
  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  kpiCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    padding: 12,
    gap: 4,
  },
  kpiValue: { fontSize: 22, fontWeight: "800", color: propertyTheme.text },
  kpiLabel: { fontSize: 11, fontWeight: "600", color: propertyTheme.textMuted },
  empty: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    borderStyle: "dashed",
    padding: 28,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: propertyTheme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: propertyTheme.text },
  emptySubtitle: { marginTop: 6, textAlign: "center", color: propertyTheme.textMuted },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  cardHead: { flex: 1 },
  propertyTitle: { fontSize: 16, fontWeight: "800", color: propertyTheme.text },
  meta: { marginTop: 4, fontSize: 12, color: propertyTheme.textMuted },
  badge: {
    backgroundColor: propertyTheme.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: propertyTheme.primary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  dates: { marginTop: 10, fontSize: 13, fontWeight: "600", color: propertyTheme.textSecondary },
  guests: { marginTop: 4, fontSize: 12, color: propertyTheme.textMuted },
  total: { marginTop: 10, fontSize: 16, fontWeight: "800", color: propertyTheme.primary },
  notes: { marginTop: 8, fontSize: 13, color: propertyTheme.textSecondary },
});
