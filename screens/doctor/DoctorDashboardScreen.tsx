import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import {
  useGetDoctorAppointmentsQuery,
  useGetPartnerDoctorDashboardQuery,
} from "../../redux/slices/doctorApi";
import { useGetNotificationsQuery, useGetUnreadNotificationCountQuery } from "../../redux/slices/notificationApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";

type DrawerNav = DrawerNavigationProp<Record<string, undefined>>;

export default function DoctorDashboardScreen() {
  const { dt } = useDoctorTranslation();
  const navigation = useNavigation<DrawerNav>();
  const { data: stats, isLoading } = useGetPartnerDoctorDashboardQuery(undefined, { pollingInterval: 45000 });
  const { data: appointments = [] } = useGetDoctorAppointmentsQuery({ filter: "upcoming" });
  const { data: unread } = useGetUnreadNotificationCountQuery(undefined, { pollingInterval: 45000 });
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, { pollingInterval: 45000 });

  const latestBooking = useMemo(
    () => notifications.find((item) => item.notificationType === "new_booking" && !item.isRead) ?? appointments[0],
    [notifications, appointments],
  );

  const statCards = useMemo(
    () =>
      stats
        ? [
            [dt("todaysAppointments"), stats.todayAppointments],
            [dt("pendingRequests"), stats.pendingAppointments],
            [dt("availableSlotsWeek"), stats.availableSlotsThisWeek],
            [dt("patients"), stats.totalPatients],
            [dt("ratingLabel"), stats.averageRating.toFixed(1)],
            [dt("monthlyEarnings"), `${stats.currency} ${stats.monthlyEarnings}`],
          ]
        : [],
    [stats, dt],
  );

  if (isLoading || !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.muted}>{dt("loadingDashboard")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{stats.clinicName}</Text>
        <Text style={styles.heroSubtitle}>{stats.specialtyName}</Text>
      </View>

      {latestBooking && (
        <Pressable style={styles.alertCard} onPress={() => navigation.navigate("DoctorAppointments")}>
          <Text style={styles.alertLabel}>{dt("newBookingAlert")}</Text>
          {"patientName" in latestBooking ? (
            <>
              <Text style={styles.alertTitle}>{latestBooking.patientName}</Text>
              <Text style={styles.alertBody}>
                {latestBooking.date} · {latestBooking.startTime}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.alertTitle}>{latestBooking.title}</Text>
              <Text style={styles.alertBody}>{latestBooking.message}</Text>
            </>
          )}
          <Text style={styles.alertCta}>{dt("viewAppointments")}</Text>
        </Pressable>
      )}

      <View style={styles.grid}>
        {statCards.map(([label, value]) => (
          <View key={String(label)} style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{dt("recentActivity")}</Text>
      {appointments.slice(0, 5).map((item) => (
        <View key={item.id} style={styles.activityRow}>
          <Text style={styles.activityName}>{item.patientName}</Text>
          <Text style={styles.activityMeta}>{item.date} · {item.startTime} · {item.status}</Text>
        </View>
      ))}
      {appointments.length === 0 && <Text style={styles.muted}>{dt("noUpcomingAppointments")}</Text>}

      <Text style={styles.sectionTitle}>{dt("quickActions")}</Text>
      {[
        ["DoctorAvailability", dt("setWeeklyAvailability")],
        ["DoctorServices", dt("manageServicesAction")],
        ["DoctorAppointments", dt("reviewAppointmentsAction")],
        ["DoctorProfile", dt("completeProfileAction")],
      ].map(([screen, label]) => (
        <Pressable key={screen} style={styles.actionBtn} onPress={() => navigation.navigate(screen)}>
          <Text style={styles.actionText}>{label}</Text>
        </Pressable>
      ))}

      <View style={styles.footerStat}>
        <Text style={styles.muted}>{dt("notifications")}: {unread?.unreadCount ?? 0}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  muted: { color: "#64748b" },
  hero: { backgroundColor: "#0f766e", borderRadius: 20, padding: 20 },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "700" },
  heroSubtitle: { color: "#ccfbf1", marginTop: 6 },
  alertCard: { backgroundColor: "#ecfeff", borderColor: "#99f6e4", borderWidth: 1, borderRadius: 16, padding: 16 },
  alertLabel: { color: "#0f766e", fontWeight: "700", fontSize: 12, textTransform: "uppercase" },
  alertTitle: { color: "#0f172a", fontSize: 18, fontWeight: "700", marginTop: 6 },
  alertBody: { color: "#475569", marginTop: 4 },
  alertCta: { color: "#0f766e", fontWeight: "700", marginTop: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { width: "47%", backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  statLabel: { color: "#64748b", fontSize: 12 },
  statValue: { color: "#0f172a", fontSize: 22, fontWeight: "700", marginTop: 8 },
  sectionTitle: { fontWeight: "700", color: "#0f172a", fontSize: 16, marginTop: 8 },
  activityRow: { backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  activityName: { fontWeight: "700", color: "#0f172a" },
  activityMeta: { color: "#64748b", marginTop: 4, fontSize: 13 },
  actionBtn: { backgroundColor: "#ecfeff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#99f6e4" },
  actionText: { color: "#0f766e", fontWeight: "700" },
  footerStat: { alignItems: "center", paddingVertical: 8 },
});
