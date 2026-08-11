import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  useGetPropertyEnquiriesQuery,
  useUpdatePropertyEnquiryStatusMutation,
} from "../../redux/slices/propertyApi";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import type { PropertyEnquiryStatus } from "../../types/property";
import { propertyTheme } from "../../components/property/propertyUi";

type EnquiryTab = "all" | "new" | "responded" | "closed";

export default function PropertyEnquiriesScreen() {
  const { pt, enquiryStatusLabel, enquiryTypeLabel } = usePropertyTranslation();
  const { data: enquiries = [], isLoading, isError, refetch } = useGetPropertyEnquiriesQuery();
  const [updateStatus] = useUpdatePropertyEnquiryStatusMutation();
  const [tab, setTab] = useState<EnquiryTab>("all");

  const filtered = useMemo(() => {
    return enquiries.filter((item) => {
      if (tab === "all") return true;
      if (tab === "new") return item.status === "pending";
      if (tab === "responded") return item.status === "responded" || item.status === "scheduled";
      if (tab === "closed") return item.status === "closed" || item.status === "rejected" || item.status === "approved";
      return true;
    });
  }, [enquiries, tab]);

  const counts = useMemo(
    () => ({
      all: enquiries.length,
      new: enquiries.filter((item) => item.status === "pending").length,
      responded: enquiries.filter((item) => item.status === "responded" || item.status === "scheduled").length,
      closed: enquiries.filter((item) =>
        item.status === "closed" || item.status === "rejected" || item.status === "approved",
      ).length,
    }),
    [enquiries],
  );

  const handleStatus = async (id: number, status: PropertyEnquiryStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
    } catch {
      Alert.alert(pt("listingFailed"));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={propertyTheme.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{pt("dashboardLoadError")}</Text>
        <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
          <Text style={styles.retryText}>{pt("tryAgain")}</Text>
        </Pressable>
      </View>
    );
  }

  const tabs: { key: EnquiryTab; label: string; count: number }[] = [
    { key: "all", label: pt("enquiryTabAll"), count: counts.all },
    { key: "new", label: pt("enquiryTabNew"), count: counts.new },
    { key: "responded", label: pt("enquiryTabResponded"), count: counts.responded },
    { key: "closed", label: pt("enquiryTabClosed"), count: counts.closed },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{pt("enquiriesInbox")}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {tabs.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(item.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {item.label} ({item.count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubbles-outline" size={32} color={propertyTheme.primary} />
          </View>
          <Text style={styles.emptyTitle}>{pt("emptyEnquiriesTitle")}</Text>
          <Text style={styles.emptySubtitle}>{pt("emptyEnquiriesSubtitle")}</Text>
        </View>
      ) : (
        filtered.map((item) => {
          const isNew = item.status === "pending";
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={18} color={propertyTheme.primary} />
                </View>
                <View style={styles.cardHead}>
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {item.propertyTitle}
                  </Text>
                  <Text style={styles.meta}>
                    {enquiryTypeLabel(item.enquiryType)} · {item.createdAt.slice(0, 16).replace("T", " ")}
                  </Text>
                </View>
                <View style={[styles.badge, isNew && styles.badgeNew]}>
                  <Text style={[styles.badgeText, isNew && styles.badgeTextNew]}>
                    {isNew ? pt("enquiryTabNew") : enquiryStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <View style={styles.actions}>
                <Pressable style={styles.primaryAction} onPress={() => void handleStatus(item.id, "responded")}>
                  <Text style={styles.primaryActionText}>{pt("markResponded")}</Text>
                </Pressable>
                <Pressable style={styles.secondaryAction} onPress={() => void handleStatus(item.id, "scheduled")}>
                  <Text style={styles.secondaryActionText}>{pt("markScheduled")}</Text>
                </Pressable>
                <Pressable style={styles.secondaryAction} onPress={() => void handleStatus(item.id, "closed")}>
                  <Text style={styles.secondaryActionText}>{pt("markClosed")}</Text>
                </Pressable>
              </View>
            </View>
          );
        })
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
  title: { fontSize: 28, fontWeight: "800", color: propertyTheme.text, marginBottom: 14 },
  tabs: { gap: 8, marginBottom: 16 },
  tab: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: propertyTheme.border,
  },
  tabActive: { backgroundColor: propertyTheme.primary, borderColor: propertyTheme.primary },
  tabText: { fontSize: 13, fontWeight: "600", color: propertyTheme.textSecondary },
  tabTextActive: { color: "#fff" },
  empty: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    borderStyle: "dashed",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: propertyTheme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: propertyTheme.text },
  emptySubtitle: {
    marginTop: 8,
    textAlign: "center",
    color: propertyTheme.textMuted,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: propertyTheme.border,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: propertyTheme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHead: { flex: 1 },
  propertyTitle: { fontWeight: "800", color: propertyTheme.text },
  meta: { marginTop: 2, fontSize: 12, color: propertyTheme.textMuted },
  badge: {
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeNew: { backgroundColor: "#fef3c7" },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#475569" },
  badgeTextNew: { color: "#92400e" },
  message: { marginTop: 12, color: propertyTheme.textSecondary, lineHeight: 21 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  primaryAction: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryActionText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  secondaryAction: {
    borderWidth: 1,
    borderColor: propertyTheme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  secondaryActionText: { color: propertyTheme.textSecondary, fontWeight: "600", fontSize: 12 },
});
