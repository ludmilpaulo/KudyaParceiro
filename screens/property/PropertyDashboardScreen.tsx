import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useGetPropertyApplicationsQuery, useGetPropertyDashboardQuery } from "../../redux/slices/propertyApi";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import PropertyAnalyticsCharts from "../../components/property/PropertyAnalyticsCharts";
import PropertyKpiCard from "../../components/property/PropertyKpiCard";
import { propertyTheme } from "../../components/property/propertyUi";
import type { AnalyticsDays } from "../../components/analytics/AnalyticsDaysFilter";
import { hasPropertyDraft } from "../../utils/propertyDraftStorage";

type DrawerNav = DrawerNavigationProp<Record<string, undefined>>;

function greetingKey(hour: number): "goodMorning" | "goodAfternoon" | "goodEvening" {
  if (hour < 12) return "goodMorning";
  if (hour < 18) return "goodAfternoon";
  return "goodEvening";
}

export default function PropertyDashboardScreen() {
  const { pt, enquiryStatusLabel } = usePropertyTranslation();
  const navigation = useNavigation<DrawerNav>();
  const [days, setDays] = useState<AnalyticsDays>(7);
  const [draftReady, setDraftReady] = useState(false);
  const { data: stats, isLoading, isError, refetch, isFetching } = useGetPropertyDashboardQuery(
    { days },
    { pollingInterval: 60000 },
  );
  const { data: applications = [] } = useGetPropertyApplicationsQuery();

  useEffect(() => {
    void hasPropertyDraft().then(setDraftReady);
  }, []);

  const activePct = useMemo(() => {
    if (!stats || !stats.totalListings) return "0%";
    return `${Math.round((stats.activeListings / stats.totalListings) * 100)}%`;
  }, [stats]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={propertyTheme.primary} />
        <Text style={styles.muted}>{pt("loadingDashboard")}</Text>
      </View>
    );
  }

  if (isError || !stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{pt("dashboardLoadError")}</Text>
        <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
          <Text style={styles.retryText}>{pt("tryAgain")}</Text>
        </Pressable>
      </View>
    );
  }

  const hour = new Date().getHours();
  const greeting = pt(greetingKey(hour));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroGreeting}>{greeting}</Text>
        <Text style={styles.heroTitle}>{stats.businessName}</Text>
        <Text style={styles.heroSubtitle}>{pt("dashboardGreetingSubtitle")}</Text>

        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate("PropertyAddWizard")}
        >
          <Ionicons name="add" size={20} color="#0f172a" />
          <Text style={styles.addBtnText}>{pt("addProperty")}</Text>
        </Pressable>
      </View>

      {draftReady ? (
        <Pressable
          style={styles.draftBanner}
          onPress={() => navigation.navigate("PropertyAddWizard")}
        >
          <Ionicons name="document-text-outline" size={18} color={propertyTheme.primary} />
          <Text style={styles.draftText}>{pt("continueListing")}</Text>
          <Ionicons name="chevron-forward" size={18} color={propertyTheme.primary} />
        </Pressable>
      ) : null}

      {stats.pendingListings > 0 || stats.pendingEnquiries > 0 ? (
        <Pressable
          style={styles.attentionBanner}
          onPress={() =>
            navigation.navigate(
              stats.pendingEnquiries > 0 ? "PropertyEnquiries" : "PropertyListings",
            )
          }
        >
          <Ionicons name="alert-circle" size={18} color="#92400e" />
          <Text style={styles.attentionText}>{pt("attentionBanner")}</Text>
        </Pressable>
      ) : null}

      <Text style={styles.sectionLabel}>{pt("propertyOverview")}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kpiRow}
      >
        <PropertyKpiCard
          icon="home-outline"
          label={pt("totalProperties")}
          value={stats.totalListings}
          hint={pt("ofListings")}
          onPress={() => navigation.navigate("PropertyListings")}
        />
        <PropertyKpiCard
          icon="checkmark-circle-outline"
          label={pt("activeProperties")}
          value={stats.activeListings}
          hint={`${activePct} ${pt("ofListings")}`}
          accent={propertyTheme.success}
          onPress={() => navigation.navigate("PropertyListings")}
        />
        <PropertyKpiCard
          icon="time-outline"
          label={pt("pendingReview")}
          value={stats.pendingListings}
          hint={pt("needsAttention")}
          accent={propertyTheme.warning}
          onPress={() => navigation.navigate("PropertyListings")}
        />
        <PropertyKpiCard
          icon="chatbubble-ellipses-outline"
          label={pt("enquiries")}
          value={stats.totalEnquiries}
          hint={`${stats.pendingEnquiries} ${pt("pending").toLowerCase()}`}
          accent="#0284c7"
          onPress={() => navigation.navigate("PropertyEnquiries")}
        />
        <PropertyKpiCard
          icon="document-text-outline"
          label={pt("applications")}
          value={applications.length}
          hint={pt("applicationsSubtitle")}
          accent="#7c3aed"
          onPress={() => navigation.navigate("PropertyApplications")}
        />
      </ScrollView>

      <PropertyAnalyticsCharts analytics={stats.analytics} days={days} onDaysChange={setDays} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{pt("recentEnquiries")}</Text>
        <Pressable onPress={() => navigation.navigate("PropertyEnquiries")}>
          <Text style={styles.link}>{pt("viewEnquiries")}</Text>
        </Pressable>
      </View>

      {stats.recentEnquiries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.muted}>{pt("emptyEnquiriesSubtitle")}</Text>
        </View>
      ) : (
        stats.recentEnquiries.slice(0, 4).map((item) => (
          <Pressable
            key={item.id}
            style={styles.enquiryCard}
            onPress={() => navigation.navigate("PropertyEnquiries")}
          >
            <View style={styles.enquiryTop}>
              <Text style={styles.enquiryTitle} numberOfLines={1}>
                {item.propertyTitle}
              </Text>
              <View
                style={[
                  styles.enquiryBadge,
                  item.status === "pending" ? styles.enquiryBadgeNew : null,
                ]}
              >
                <Text style={styles.enquiryBadgeText}>{enquiryStatusLabel(item.status)}</Text>
              </View>
            </View>
            <Text style={styles.enquiryBody} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.enquiryMeta}>{item.createdAt.slice(0, 16).replace("T", " ")}</Text>
          </Pressable>
        ))
      )}

      {isFetching ? <Text style={styles.refreshing}>…</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: propertyTheme.background },
  content: { padding: 16, paddingBottom: 40, maxWidth: 1100, width: "100%", alignSelf: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { marginTop: 8, color: propertyTheme.textMuted, textAlign: "center" },
  error: { color: propertyTheme.danger, textAlign: "center", marginBottom: 12 },
  retryBtn: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  hero: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
  },
  heroGreeting: { color: "#ccfbf1", fontSize: 13, fontWeight: "600" },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 4 },
  heroSubtitle: { color: "#99f6e4", marginTop: 6, fontSize: 14, lineHeight: 20 },
  addBtn: {
    marginTop: 18,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: propertyTheme.accent,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addBtnText: { color: "#0f172a", fontWeight: "800", fontSize: 14 },
  draftBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  draftText: { flex: 1, color: propertyTheme.primary, fontWeight: "700" },
  attentionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  attentionText: { flex: 1, color: "#92400e", fontWeight: "600", fontSize: 13 },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "700",
    color: propertyTheme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  kpiRow: { gap: 12, paddingRight: 8, paddingBottom: 4 },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: propertyTheme.text },
  link: { color: propertyTheme.primary, fontWeight: "700", fontSize: 13 },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: propertyTheme.border,
  },
  enquiryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: propertyTheme.border,
  },
  enquiryTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  enquiryTitle: { flex: 1, fontWeight: "700", color: propertyTheme.text },
  enquiryBadge: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  enquiryBadgeNew: { backgroundColor: "#fef3c7" },
  enquiryBadgeText: { fontSize: 10, fontWeight: "700", color: "#475569" },
  enquiryBody: { marginTop: 6, color: propertyTheme.textSecondary, lineHeight: 20 },
  enquiryMeta: { marginTop: 8, fontSize: 12, color: propertyTheme.textMuted },
  refreshing: { textAlign: "center", color: propertyTheme.textMuted, marginTop: 8 },
});
