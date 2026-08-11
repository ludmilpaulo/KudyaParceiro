import React, { useMemo, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  useGetPropertyListingsQuery,
  useUpdatePropertyListingMutation,
} from "../../redux/slices/propertyApi";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import PropertyListingCard from "../../components/property/PropertyListingCard";
import PropertyEmptyState from "../../components/property/PropertyEmptyState";
import {
  getListingUiStatus,
  listingPurpose,
  propertyTheme,
  type PropertyUiStatus,
} from "../../components/property/propertyUi";
import type { PropertyListing } from "../../types/property";

type DrawerNav = DrawerNavigationProp<{
  PropertyAddWizard: undefined;
  PropertyListings: undefined;
  PropertyStayCalendar: { listingId?: number; listingTitle?: string } | undefined;
}>;
type StatusTab = "all" | PropertyUiStatus;
type PurposeFilter = "all" | "rent" | "stay" | "sale";

export default function PropertyListingsScreen() {
  const { pt } = usePropertyTranslation();
  const navigation = useNavigation<DrawerNav>();
  const { data: listings = [], isLoading, isError, refetch } = useGetPropertyListingsQuery();
  const [updateListing] = useUpdatePropertyListingMutation();

  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [purpose, setPurpose] = useState<PurposeFilter>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const base = { all: listings.length, active: 0, pending: 0, draft: 0, inactive: 0, rejected: 0, suspended: 0 };
    for (const item of listings) {
      base[getListingUiStatus(item)] += 1;
    }
    return base;
  }, [listings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((item) => {
      const status = getListingUiStatus(item);
      if (statusTab === "pending") {
        if (status !== "pending" && status !== "rejected") return false;
      } else if (statusTab === "inactive") {
        if (status !== "inactive" && status !== "suspended") return false;
      } else if (statusTab !== "all" && status !== statusTab) {
        return false;
      }
      if (purpose !== "all" && listingPurpose(item) !== purpose) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.suburb.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q)
      );
    });
  }, [listings, statusTab, purpose, search]);

  const toggleAvailability = async (item: PropertyListing) => {
    try {
      await updateListing({ id: item.id, patch: { isAvailable: !item.isAvailable } }).unwrap();
    } catch {
      Alert.alert(pt("listingFailed"));
    }
  };

  const tabs: { key: StatusTab; label: string; count: number }[] = [
    { key: "all", label: pt("tabAll"), count: counts.all },
    { key: "active", label: pt("tabActive"), count: counts.active },
    { key: "pending", label: pt("tabPending"), count: counts.pending + counts.rejected },
    { key: "draft", label: pt("tabDraft"), count: counts.draft },
    { key: "inactive", label: pt("tabInactive"), count: counts.inactive + counts.suspended },
  ];

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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{pt("properties")}</Text>
            <Text style={styles.subtitle}>{pt("managePropertiesSubtitle")}</Text>
          </View>
          <Pressable
            style={styles.addBtn}
            onPress={() => navigation.navigate("PropertyAddWizard")}
          >
            <Ionicons name="add" size={22} color="#0f172a" />
            <Text style={styles.addBtnText}>{pt("addProperty")}</Text>
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={propertyTheme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={pt("searchProperties")}
            placeholderTextColor={propertyTheme.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => {
            const active = statusTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setStatusTab(tab.key)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label} ({tab.count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.filterLabel}>{pt("filterPurpose")}</Text>
        <View style={styles.purposeRow}>
          {(
            [
              ["all", pt("purposeAll")],
              ["rent", pt("purposeRent")],
              ["stay", pt("purposeStay")],
              ["sale", pt("purposeSale")],
            ] as const
          ).map(([key, label]) => {
            const active = purpose === key;
            return (
              <Pressable
                key={key}
                style={[styles.purposeChip, active && styles.purposeChipActive]}
                onPress={() => setPurpose(key)}
              >
                <Text style={[styles.purposeText, active && styles.purposeTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {listings.length === 0 ? (
          <PropertyEmptyState
            title={pt("emptyPropertiesTitle")}
            subtitle={pt("emptyPropertiesSubtitle")}
            actionLabel={pt("addProperty")}
            onAction={() => navigation.navigate("PropertyAddWizard")}
          />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyFilter}>
            <Text style={styles.muted}>{pt("noMatchFilters")}</Text>
            <Pressable
              onPress={() => {
                setStatusTab("all");
                setPurpose("all");
                setSearch("");
              }}
            >
              <Text style={styles.link}>{pt("clearFilters")}</Text>
            </Pressable>
          </View>
        ) : (
          filtered.map((item) => (
            <PropertyListingCard
              key={item.id}
              listing={item}
              onManage={() => navigation.navigate("PropertyListings")}
              onToggleAvailability={() => void toggleAvailability(item)}
              onManageStay={
                listingPurpose(item) === "stay"
                  ? () =>
                      navigation.navigate("PropertyStayCalendar", {
                        listingId: item.id,
                        listingTitle: item.title,
                      })
                  : undefined
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: propertyTheme.background },
  content: { padding: 16, paddingBottom: 40, maxWidth: 1100, width: "100%", alignSelf: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  error: { color: propertyTheme.danger, textAlign: "center", marginBottom: 12 },
  retryBtn: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  headerText: { flex: 1 },
  title: { fontSize: 28, fontWeight: "800", color: propertyTheme.text },
  subtitle: { marginTop: 4, color: propertyTheme.textMuted, fontSize: 14, lineHeight: 20 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: propertyTheme.accent,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addBtnText: { color: "#0f172a", fontWeight: "800", fontSize: 13 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12, color: propertyTheme.text },
  tabs: { gap: 8, paddingBottom: 4 },
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
  filterLabel: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    color: propertyTheme.textMuted,
    textTransform: "uppercase",
  },
  purposeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  purposeChip: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: propertyTheme.border,
  },
  purposeChipActive: { backgroundColor: "#ecfdf5", borderColor: propertyTheme.primary },
  purposeText: { fontSize: 13, fontWeight: "600", color: propertyTheme.textSecondary },
  purposeTextActive: { color: propertyTheme.primary },
  emptyFilter: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: propertyTheme.border,
  },
  muted: { color: propertyTheme.textMuted, marginBottom: 8 },
  link: { color: propertyTheme.primary, fontWeight: "700" },
});
