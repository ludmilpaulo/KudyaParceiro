import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "../../redux/slices/notificationApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";

export default function DoctorNotificationsScreen() {
  const { dt } = useDoctorTranslation();
  const { data: notifications = [], isLoading, refetch } = useGetNotificationsQuery(undefined, {
    pollingInterval: 45000,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const handleMarkRead = async (id: number) => {
    await markRead(id);
    await refetch();
  };

  const handleMarkAll = async () => {
    await markAllRead();
    await refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.markAllBtn} onPress={handleMarkAll}>
        <Text style={styles.markAllText}>{dt("markAllRead")}</Text>
      </Pressable>

      {notifications.length === 0 ? (
        <Text style={styles.empty}>{dt("noNotificationsYet")}</Text>
      ) : (
        notifications.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.card, !item.isRead && styles.unread]}
            onPress={() => handleMarkRead(item.id)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.createdAt}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  markAllBtn: { alignSelf: "flex-end" },
  markAllText: { color: "#0f766e", fontWeight: "700" },
  empty: { color: "#64748b", textAlign: "center", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  unread: { borderColor: "#0f766e", backgroundColor: "#ecfeff" },
  title: { fontWeight: "700", color: "#0f172a" },
  message: { color: "#475569", marginTop: 4 },
  time: { color: "#94a3b8", marginTop: 8, fontSize: 12 },
});
