import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useGetPartnerDoctorDashboardQuery } from "../../redux/slices/doctorApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";
import { verificationStatusLabel } from "../../configs/doctorTranslations";

export default function DoctorBusinessProfileScreen() {
  const { dt, languageCode } = useDoctorTranslation();
  const { data: stats, isLoading } = useGetPartnerDoctorDashboardQuery();

  if (isLoading || !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{dt("businessProfile")}</Text>
      <Text style={styles.desc}>{dt("businessProfileDesc")}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {dt("verifiedLabel")} · {verificationStatusLabel(stats.verificationStatus, languageCode)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{dt("activeLabel")}</Text>
        <Text style={styles.value}>{stats.isActiveOnPlatform ? dt("activeLabel") : dt("inactiveLabel")}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{dt("profileCompletionLabel")}</Text>
        <Text style={styles.value}>{stats.profileCompletionPercent}%</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{dt("ratingLabel")}</Text>
        <Text style={styles.value}>{stats.averageRating.toFixed(1)} ({stats.reviewCount})</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  desc: { color: "#64748b", lineHeight: 20 },
  badge: { alignSelf: "flex-start", backgroundColor: "#d1fae5", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: "#065f46", fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 14, borderRadius: 12 },
  label: { color: "#64748b" },
  value: { color: "#0f172a", fontWeight: "700" },
});
