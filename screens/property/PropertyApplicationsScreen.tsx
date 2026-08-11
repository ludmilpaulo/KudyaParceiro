import React, { useMemo, useState } from "react";
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
import { useGetPropertyApplicationsQuery } from "../../redux/slices/propertyApi";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import type { PropertyApplication, PropertyApplicationStatus } from "../../types/property";
import { propertyTheme } from "../../components/property/propertyUi";

type ApplicationsTab = "all" | "new" | "reviewing" | "approved" | "rejected";
type DrawerNav = DrawerNavigationProp<Record<string, { applicationId: number } | undefined>>;

function appTabForStatus(status: PropertyApplicationStatus): Exclude<ApplicationsTab, "all"> {
  if (status === "submitted") return "new";
  if (status === "rejected") return "rejected";
  if (status === "lease_executed" || status === "active") return "approved";
  return "reviewing";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function PropertyApplicationsScreen() {
  const navigation = useNavigation<DrawerNav>();
  const { pt } = usePropertyTranslation();
  const { data: applications = [], isLoading, isError, refetch } = useGetPropertyApplicationsQuery();
  const [tab, setTab] = useState<ApplicationsTab>("all");

  const counts = useMemo(() => {
    const result: Record<ApplicationsTab, number> = {
      all: applications.length,
      new: 0,
      reviewing: 0,
      approved: 0,
      rejected: 0,
    };
    applications.forEach((application) => {
      result[appTabForStatus(application.status)] += 1;
    });
    return result;
  }, [applications]);

  const filtered = useMemo(
    () => applications.filter((application) => tab === "all" || appTabForStatus(application.status) === tab),
    [applications, tab],
  );

  const tabs: { key: ApplicationsTab; label: string }[] = [
    { key: "all", label: pt("applicationTabAll") },
    { key: "new", label: pt("applicationTabNew") },
    { key: "reviewing", label: pt("applicationTabReviewing") },
    { key: "approved", label: pt("applicationTabApproved") },
    { key: "rejected", label: pt("applicationTabRejected") },
  ];

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={propertyTheme.primary} /></View>;
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{pt("applicationsLoadError")}</Text>
        <Pressable style={styles.primaryButton} onPress={() => void refetch()}>
          <Text style={styles.primaryButtonText}>{pt("tryAgain")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{pt("applications")}</Text>
      <Text style={styles.subtitle}>{pt("applicationsSubtitle")}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {tabs.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable key={item.key} onPress={() => setTab(item.key)} style={[styles.tab, active && styles.tabActive]}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {item.label} ({counts[item.key]})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={38} color={propertyTheme.primary} />
          <Text style={styles.emptyTitle}>{pt("emptyApplicationsTitle")}</Text>
          <Text style={styles.emptyText}>{pt("emptyApplicationsSubtitle")}</Text>
        </View>
      ) : (
        filtered.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onPress={() => navigation.navigate("PropertyApplicationDetail", { applicationId: application.id })}
          />
        ))
      )}
    </ScrollView>
  );
}

function ApplicationCard({ application, onPress }: { application: PropertyApplication; onPress: () => void }) {
  const { pt } = usePropertyTranslation();
  const statusTab = appTabForStatus(application.status);
  const statusColor =
    statusTab === "rejected"
      ? propertyTheme.danger
      : statusTab === "approved"
        ? propertyTheme.success
        : statusTab === "new"
          ? propertyTheme.warning
          : propertyTheme.primary;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}><Ionicons name="person-outline" size={20} color={propertyTheme.primary} /></View>
        <View style={styles.cardHead}>
          <Text style={styles.propertyTitle} numberOfLines={1}>{application.propertyTitle}</Text>
          <Text style={styles.meta}>{application.propertyCity} · {formatDate(application.submittedAt ?? application.createdAt)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={propertyTheme.textMuted} />
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.badge, { color: statusColor }]}>{application.status.replace(/_/g, " ")}</Text>
        <Text style={styles.rent}>
          {application.proposedRent ? `${application.currency} ${application.proposedRent}` : pt("applicationRentNotProvided")}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: propertyTheme.background },
  content: { padding: 16, paddingBottom: 40, maxWidth: 900, width: "100%", alignSelf: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "800", color: propertyTheme.text },
  subtitle: { marginTop: 4, color: propertyTheme.textMuted, lineHeight: 20 },
  tabs: { gap: 8, marginTop: 16, marginBottom: 16 },
  tab: { borderWidth: 1, borderColor: propertyTheme.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#fff" },
  tabActive: { backgroundColor: propertyTheme.primary, borderColor: propertyTheme.primary },
  tabText: { color: propertyTheme.textSecondary, fontWeight: "700", fontSize: 13 },
  tabTextActive: { color: "#fff" },
  card: { backgroundColor: propertyTheme.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: propertyTheme.border },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: propertyTheme.primarySoft, justifyContent: "center", alignItems: "center" },
  cardHead: { flex: 1 },
  propertyTitle: { fontSize: 16, fontWeight: "800", color: propertyTheme.text },
  meta: { marginTop: 3, fontSize: 12, color: propertyTheme.textMuted },
  cardFooter: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: propertyTheme.border, flexDirection: "row", justifyContent: "space-between", gap: 8 },
  badge: { textTransform: "capitalize", fontSize: 12, fontWeight: "800" },
  rent: { color: propertyTheme.textSecondary, fontSize: 12, fontWeight: "700" },
  empty: { backgroundColor: "#fff", borderWidth: 1, borderStyle: "dashed", borderColor: propertyTheme.border, borderRadius: 18, alignItems: "center", padding: 38 },
  emptyTitle: { marginTop: 12, fontSize: 18, color: propertyTheme.text, fontWeight: "800" },
  emptyText: { marginTop: 6, textAlign: "center", color: propertyTheme.textMuted, lineHeight: 20 },
  error: { color: propertyTheme.danger, marginBottom: 12, textAlign: "center" },
  primaryButton: { backgroundColor: propertyTheme.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  primaryButtonText: { color: "#fff", fontWeight: "800" },
});
