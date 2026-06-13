import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useGetPartnerDoctorDashboardQuery } from "../../redux/slices/doctorApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";

export default function DoctorReviewsScreen() {
  const { dt } = useDoctorTranslation();
  const { data: stats, isLoading } = useGetPartnerDoctorDashboardQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!stats || stats.reviewCount === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{dt("emptyReviews")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{dt("reviews")}</Text>
        <Text style={styles.rating}>{stats.averageRating.toFixed(1)} ★</Text>
        <Text style={styles.count}>{stats.reviewCount} reviews</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  empty: { color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e2e8f0" },
  title: { fontWeight: "700", color: "#0f172a", fontSize: 18 },
  rating: { fontSize: 36, fontWeight: "700", color: "#0f766e", marginTop: 12 },
  count: { color: "#64748b", marginTop: 8 },
});
