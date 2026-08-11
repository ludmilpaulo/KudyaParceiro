import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useGetPropertyListingsQuery } from "../../redux/slices/propertyApi";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import {
  createBlockedDates,
  deleteBlockedDate,
  fetchBlockedDates,
  fetchListingAvailability,
} from "../../services/stayBookingApi";
import type { PropertyAvailabilityDay, PropertyBlockedDate, PropertyListing } from "../../types/property";
import { listingPurpose, propertyTheme } from "../../components/property/propertyUi";

type CalendarRoute = RouteProp<
  { PropertyStayCalendar: { listingId?: number; listingTitle?: string } | undefined },
  "PropertyStayCalendar"
>;

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function statusColor(status: string): string {
  if (status === "available") return "#059669";
  if (status === "blocked") return "#64748b";
  if (status === "booked") return "#0f766e";
  if (status === "pending") return "#d97706";
  return "#94a3b8";
}

export default function PropertyStayCalendarScreen() {
  const { pt } = usePropertyTranslation();
  const route = useRoute<CalendarRoute>();
  const { data: listings = [], isLoading: listingsLoading } = useGetPropertyListingsQuery();
  const stayListings = useMemo(
    () => listings.filter((item) => listingPurpose(item) === "stay"),
    [listings],
  );

  const [listingId, setListingId] = useState<number | null>(route.params?.listingId ?? null);
  const [days, setDays] = useState<PropertyAvailabilityDay[]>([]);
  const [blocks, setBlocks] = useState<PropertyBlockedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [startDate, setStartDate] = useState(isoToday());
  const [endDate, setEndDate] = useState(addDays(isoToday(), 1));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = stayListings.find((item) => item.id === listingId) ?? null;

  useEffect(() => {
    if (listingId != null) return;
    if (route.params?.listingId) {
      setListingId(route.params.listingId);
      return;
    }
    if (stayListings.length > 0) setListingId(stayListings[0].id);
  }, [listingId, route.params?.listingId, stayListings]);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(false);
    try {
      const from = isoToday();
      const to = addDays(from, 61);
      const [availability, blocked] = await Promise.all([
        fetchListingAvailability(id, from, to),
        fetchBlockedDates(id),
      ]);
      setDays(availability);
      setBlocks(blocked);
    } catch {
      setError(true);
      setDays([]);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (listingId == null) return;
    void load(listingId);
  }, [listingId, load]);

  const onBlock = async () => {
    if (listingId == null) return;
    if (!startDate || !endDate || endDate < startDate) {
      Alert.alert(pt("stayBlockInvalidRange"));
      return;
    }
    setBusy(true);
    try {
      await createBlockedDates(listingId, {
        startDate,
        endDate,
        reason: reason.trim(),
      });
      setReason("");
      await load(listingId);
      Alert.alert(pt("stayBlockCreated"));
    } catch (err) {
      Alert.alert(
        pt("stayBlockFailed"),
        err instanceof Error ? err.message : pt("stayBlockFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const onUnblock = async (block: PropertyBlockedDate) => {
    if (listingId == null) return;
    setBusy(true);
    try {
      await deleteBlockedDate(listingId, block.id);
      await load(listingId);
    } catch (err) {
      Alert.alert(
        pt("stayBlockFailed"),
        err instanceof Error ? err.message : pt("stayBlockFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  if (listingsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={propertyTheme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{pt("availability")}</Text>
      <Text style={styles.subtitle}>{pt("availabilitySubtitle")}</Text>

      {stayListings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{pt("noStayListingsTitle")}</Text>
          <Text style={styles.emptySubtitle}>{pt("noStayListingsSubtitle")}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.filterLabel}>{pt("selectStayListing")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {stayListings.map((item: PropertyListing) => {
              const active = item.id === listingId;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setListingId(item.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {selected ? (
            <Text style={styles.selectedTitle}>{selected.title}</Text>
          ) : null}

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 24 }} color={propertyTheme.primary} />
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.error}>{pt("availabilityLoadError")}</Text>
              <Pressable
                style={styles.retryBtn}
                onPress={() => listingId != null && void load(listingId)}
              >
                <Text style={styles.retryText}>{pt("tryAgain")}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.legend}>
                {(
                  [
                    ["available", pt("stayStatusAvailable")],
                    ["blocked", pt("stayStatusBlocked")],
                    ["booked", pt("stayStatusBooked")],
                    ["pending", pt("stayStatusPending")],
                  ] as const
                ).map(([status, label]) => (
                  <View key={status} style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: statusColor(status) }]} />
                    <Text style={styles.legendText}>{label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.calendar}>
                {days.map((day) => (
                  <View key={day.date} style={styles.dayCell}>
                    <Text style={styles.dayDate}>{day.date.slice(8)}</Text>
                    <View style={[styles.dayStatus, { backgroundColor: statusColor(day.status) }]} />
                    <Text style={styles.dayPrice} numberOfLines={1}>
                      {day.status === "available" && day.price ? day.price : day.status.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.form}>
                <Text style={styles.formTitle}>{pt("blockDates")}</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={propertyTheme.textMuted}
                />
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={propertyTheme.textMuted}
                />
                <TextInput
                  style={styles.input}
                  value={reason}
                  onChangeText={setReason}
                  placeholder={pt("blockReason")}
                  placeholderTextColor={propertyTheme.textMuted}
                />
                <Pressable
                  style={[styles.primaryBtn, busy && styles.btnDisabled]}
                  disabled={busy}
                  onPress={() => void onBlock()}
                >
                  <Text style={styles.primaryBtnText}>{pt("blockDates")}</Text>
                </Pressable>
              </View>

              <Text style={styles.formTitle}>{pt("blockedDatesList")}</Text>
              {blocks.length === 0 ? (
                <Text style={styles.muted}>{pt("noBlockedDates")}</Text>
              ) : (
                blocks.map((block) => (
                  <View key={block.id} style={styles.blockCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.blockRange}>
                        {block.startDate} → {block.endDate}
                      </Text>
                      {block.reason ? <Text style={styles.muted}>{block.reason}</Text> : null}
                    </View>
                    <Pressable
                      style={styles.secondaryBtn}
                      disabled={busy}
                      onPress={() => void onUnblock(block)}
                    >
                      <Ionicons name="trash-outline" size={16} color={propertyTheme.danger} />
                      <Text style={styles.unblockText}>{pt("unblockDates")}</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: propertyTheme.background },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "800", color: propertyTheme.text },
  subtitle: { marginTop: 4, marginBottom: 16, color: propertyTheme.textMuted, fontSize: 14 },
  filterLabel: { fontSize: 13, fontWeight: "700", color: propertyTheme.textSecondary, marginBottom: 8 },
  chips: { gap: 8, paddingBottom: 12 },
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: propertyTheme.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: 220,
  },
  chipActive: { backgroundColor: propertyTheme.primary, borderColor: propertyTheme.primary },
  chipText: { color: propertyTheme.textSecondary, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: "#fff" },
  selectedTitle: { fontSize: 16, fontWeight: "800", color: propertyTheme.text, marginBottom: 12 },
  empty: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    borderStyle: "dashed",
    padding: 28,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: propertyTheme.text },
  emptySubtitle: { marginTop: 6, textAlign: "center", color: propertyTheme.textMuted },
  errorBox: { alignItems: "center", paddingVertical: 20 },
  error: { color: propertyTheme.danger, marginBottom: 12, textAlign: "center" },
  retryBtn: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: propertyTheme.textMuted, fontWeight: "600" },
  calendar: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 20 },
  dayCell: {
    width: "13.5%",
    minWidth: 42,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    padding: 6,
    alignItems: "center",
  },
  dayDate: { fontSize: 11, fontWeight: "700", color: propertyTheme.text },
  dayStatus: { width: 8, height: 8, borderRadius: 4, marginVertical: 4 },
  dayPrice: { fontSize: 9, color: propertyTheme.textMuted },
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  formTitle: { fontSize: 16, fontWeight: "800", color: propertyTheme.text, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: propertyTheme.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: propertyTheme.text,
    backgroundColor: "#fff",
  },
  primaryBtn: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  muted: { color: propertyTheme.textMuted, fontSize: 13 },
  blockCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    padding: 14,
    marginTop: 8,
  },
  blockRange: { fontWeight: "700", color: propertyTheme.text },
  secondaryBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  unblockText: { color: propertyTheme.danger, fontWeight: "700", fontSize: 12 },
});
