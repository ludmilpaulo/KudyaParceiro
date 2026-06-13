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
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  useGetDoctorAppointmentsQuery,
  useUpdateDoctorAppointmentStatusMutation,
} from "../../redux/slices/doctorApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";
import type { DoctorStackParamList } from "../../navigation/doctorTypes";

const FILTERS = [
  { id: "all", key: "filterAll" as const },
  { id: "today", key: "filterToday" as const },
  { id: "upcoming", key: "filterUpcoming" as const },
  { id: "pending", key: "filterPending" as const },
  { id: "completed", key: "filterCompleted" as const },
  { id: "cancelled", key: "filterCancelled" as const },
];

export default function DoctorAppointmentsScreen() {
  const { dt } = useDoctorTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<DoctorStackParamList>>();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { data: appointments = [], isLoading, refetch } = useGetDoctorAppointmentsQuery({ filter, search });
  const [updateStatus, { isLoading: updating }] = useUpdateDoctorAppointmentStatusMutation();

  const filtered = useMemo(() => {
    if (!search.trim()) return appointments;
    const q = search.toLowerCase();
    return appointments.filter(
      (item) => item.patientName.toLowerCase().includes(q) || item.patientEmail.toLowerCase().includes(q),
    );
  }, [appointments, search]);

  const changeStatus = async (id: number, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      await refetch();
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail;
      Alert.alert(dt("error"), detail || dt("error"));
    }
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
      <TextInput
        style={styles.search}
        placeholder={dt("searchPatient")}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.chip, filter === item.id && styles.chipActive]}
            onPress={() => setFilter(item.id)}
          >
            <Text style={[styles.chipText, filter === item.id && styles.chipTextActive]}>{dt(item.key)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <Text style={styles.empty}>{dt("noAppointmentsFilter")}</Text>
      ) : (
        filtered.map((appointment) => (
          <Pressable
            key={appointment.id}
            style={styles.card}
            onPress={() => navigation.navigate("DoctorAppointmentDetails", { appointment })}
          >
            <Text style={styles.patient}>{appointment.patientName}</Text>
            <Text style={styles.meta}>
              {appointment.date} · {appointment.startTime}–{appointment.endTime}
            </Text>
            <Text style={styles.status}>{dt("statusLabel")}: {appointment.status}</Text>

            <View style={styles.actions}>
              {appointment.status === "pending" && (
                <Pressable style={styles.btn} disabled={updating} onPress={() => changeStatus(appointment.id, "confirmed")}>
                  <Text style={styles.btnText}>{dt("confirmAppointment")}</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  search: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12 },
  filters: { gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#e2e8f0" },
  chipActive: { backgroundColor: "#0f766e" },
  chipText: { color: "#475569", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  empty: { color: "#64748b", textAlign: "center", marginTop: 24 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  patient: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  meta: { color: "#64748b", marginTop: 4 },
  status: { marginTop: 8, color: "#0f766e", fontWeight: "700", textTransform: "capitalize" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  btn: { backgroundColor: "#0f766e", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});
