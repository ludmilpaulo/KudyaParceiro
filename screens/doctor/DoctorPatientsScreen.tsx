import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGetDoctorAppointmentsQuery } from "../../redux/slices/doctorApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";

export default function DoctorPatientsScreen() {
  const { dt } = useDoctorTranslation();
  const { data: appointments = [], isLoading } = useGetDoctorAppointmentsQuery({ filter: "all" });

  const patients = useMemo(() => {
    const map = new Map<string, { name: string; email: string; visits: number }>();
    appointments.forEach((item) => {
      const key = item.patientEmail || item.patientName;
      const existing = map.get(key);
      if (existing) {
        existing.visits += 1;
      } else {
        map.set(key, { name: item.patientName, email: item.patientEmail, visits: 1 });
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (patients.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{dt("emptyPatients")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {patients.map((patient) => (
        <View key={patient.email || patient.name} style={styles.card}>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.email}>{patient.email}</Text>
          <Text style={styles.visits}>{patient.visits} visit(s)</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  empty: { color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  name: { fontWeight: "700", color: "#0f172a", fontSize: 16 },
  email: { color: "#64748b", marginTop: 4 },
  visits: { color: "#0f766e", marginTop: 8, fontWeight: "600" },
});
