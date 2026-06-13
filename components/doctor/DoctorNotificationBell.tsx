import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "../../redux/slices/notificationApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";

type Props = {
  onNewBooking?: () => void;
};

export default function DoctorNotificationBell({ onNewBooking }: Props) {
  const { dt } = useDoctorTranslation();
  const [open, setOpen] = useState(false);
  const seenBookingIds = useRef<Set<number>>(new Set());

  const { data: notifications = [], refetch } = useGetNotificationsQuery(undefined, {
    pollingInterval: 45000,
  });
  const { data: unreadData } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 45000,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const unreadCount = unreadData?.unreadCount ?? 0;
  const bookingAlerts = notifications.filter((item) => item.notificationType === "new_booking").slice(0, 3);

  useEffect(() => {
    notifications.forEach((item) => {
      if (item.notificationType !== "new_booking" || item.isRead) return;
      if (seenBookingIds.current.has(item.id)) return;
      seenBookingIds.current.add(item.id);
      onNewBooking?.();
    });
  }, [notifications, onNewBooking]);

  return (
    <>
      <Pressable style={styles.bell} onPress={() => { setOpen(true); void refetch(); }}>
        <Ionicons name="notifications-outline" size={22} color="#fff" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>{dt("notifications")}</Text>
                <Text style={styles.sheetSubtitle}>{unreadCount} {dt("unreadCount")}</Text>
              </View>
              <Pressable onPress={() => markAllRead()}>
                <Text style={styles.markAll}>{dt("markAllRead")}</Text>
              </Pressable>
            </View>

            {bookingAlerts.length > 0 && (
              <View style={styles.alertSection}>
                <Text style={styles.alertLabel}>{dt("newBookingsSection")}</Text>
                {bookingAlerts.map((item) => (
                  <View key={item.id} style={styles.alertCard}>
                    <Text style={styles.alertTitle}>{item.title}</Text>
                    <Text style={styles.alertBody}>{item.message}</Text>
                  </View>
                ))}
              </View>
            )}

            <ScrollView style={styles.list}>
              {notifications.length === 0 ? (
                <Text style={styles.empty}>{dt("noNotificationsYet")}</Text>
              ) : (
                notifications.map((item) => (
                  <Pressable
                    key={item.id}
                    style={[styles.row, !item.isRead && styles.rowUnread]}
                    onPress={() => !item.isRead && markRead(item.id)}
                  >
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowMessage}>{item.message}</Text>
                      <Text style={styles.rowTime}>{item.createdAt}</Text>
                    </View>
                    {!item.isRead && <Text style={styles.readAction}>{dt("readAction")}</Text>}
                  </Pressable>
                ))
              )}
            </ScrollView>

            <Pressable style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeText}>{dt("cancelAppointment") === "Cancel" ? "Close" : "Fechar"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bell: { padding: 8, position: "relative" },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ef4444",
    borderRadius: 999,
    minWidth: 18,
    minHeight: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", padding: 16 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  sheetSubtitle: { color: "#64748b", fontSize: 12 },
  markAll: { color: "#0f766e", fontWeight: "700" },
  alertSection: { backgroundColor: "#ecfeff", borderRadius: 12, padding: 12, marginBottom: 12 },
  alertLabel: { color: "#0f766e", fontWeight: "700", fontSize: 12, textTransform: "uppercase" },
  alertCard: { backgroundColor: "#fff", borderRadius: 10, padding: 10, marginTop: 8 },
  alertTitle: { fontWeight: "700", color: "#0f172a" },
  alertBody: { color: "#475569", marginTop: 4 },
  list: { maxHeight: 320 },
  empty: { textAlign: "center", color: "#64748b", paddingVertical: 24 },
  row: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  rowUnread: { backgroundColor: "#f0fdfa" },
  rowBody: { flex: 1 },
  rowTitle: { fontWeight: "700", color: "#0f172a" },
  rowMessage: { color: "#475569", marginTop: 4 },
  rowTime: { color: "#94a3b8", fontSize: 11, marginTop: 4 },
  readAction: { color: "#0f766e", fontWeight: "700", fontSize: 12 },
  closeBtn: { marginTop: 12, alignItems: "center", padding: 12 },
  closeText: { color: "#64748b", fontWeight: "600" },
});
