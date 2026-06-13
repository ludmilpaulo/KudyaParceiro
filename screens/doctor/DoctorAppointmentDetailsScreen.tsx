import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DoctorAppointment } from "../../types/doctor";
import { useUpdateDoctorAppointmentStatusMutation } from "../../redux/slices/doctorApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";
import type { DoctorStackParamList } from "../../navigation/doctorTypes";

type Props = NativeStackScreenProps<DoctorStackParamList, "DoctorAppointmentDetails">;

export default function DoctorAppointmentDetailsScreen({ route, navigation }: Props) {
  const { dt } = useDoctorTranslation();
  const appointment = route.params.appointment as DoctorAppointment;
  const [updateStatus, { isLoading }] = useUpdateDoctorAppointmentStatusMutation();

  const changeStatus = async (status: string) => {
    try {
      await updateStatus({ id: appointment.id, status }).unwrap();
      Alert.alert(dt("success"), dt("success"));
      navigation.goBack();
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail;
      Alert.alert(dt("error"), detail || dt("error"));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{dt("appointmentDetails")}</Text>
      <View style={styles.card}>
        <Text style={styles.patient}>{appointment.patientName}</Text>
        <Text style={styles.meta}>{appointment.patientEmail}</Text>
        <Text style={styles.meta}>
          {appointment.date} · {appointment.startTime}–{appointment.endTime}
        </Text>
        <Text style={styles.meta}>{appointment.serviceName ?? "Consultation"} · {appointment.appointmentType}</Text>
        <Text style={styles.status}>{dt("statusLabel")}: {appointment.status}</Text>
        <Text style={styles.fee}>
          {appointment.currency} {appointment.consultationFee}
        </Text>
        {appointment.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>{dt("patientNote")}</Text>
            <Text style={styles.notes}>{appointment.notes}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {appointment.status === "pending" && (
          <Pressable style={styles.btn} disabled={isLoading} onPress={() => changeStatus("confirmed")}>
            <Text style={styles.btnText}>{dt("confirmAppointment")}</Text>
          </Pressable>
        )}
        {["pending", "confirmed"].includes(appointment.status) && (
          <>
            <Pressable style={styles.btn} disabled={isLoading} onPress={() => changeStatus("completed")}>
              <Text style={styles.btnText}>{dt("completeAppointment")}</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnWarn]} disabled={isLoading} onPress={() => changeStatus("no_show")}>
              <Text style={styles.btnText}>{dt("noShow")}</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnOutline]} disabled={isLoading} onPress={() => changeStatus("cancelled")}>
              <Text style={styles.btnOutlineText}>{dt("cancelAppointment")}</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  patient: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  meta: { color: "#64748b", marginTop: 4 },
  status: { marginTop: 12, color: "#0f766e", fontWeight: "700", textTransform: "capitalize" },
  fee: { marginTop: 8, fontSize: 18, fontWeight: "700", color: "#0f172a" },
  notesBox: { marginTop: 12, backgroundColor: "#f8fafc", borderRadius: 10, padding: 12 },
  notesLabel: { fontWeight: "700", color: "#475569", fontSize: 12 },
  notes: { color: "#0f172a", marginTop: 4 },
  actions: { gap: 10 },
  btn: { backgroundColor: "#0f766e", borderRadius: 12, padding: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
  btnOutline: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#0f766e" },
  btnOutlineText: { color: "#0f766e", fontWeight: "700" },
  btnWarn: { backgroundColor: "#ea580c" },
});
