import React, { useState } from "react";
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
import {
  useCreateDoctorServiceMutation,
  useDeleteDoctorServiceMutation,
  useGetDoctorServicesQuery,
} from "../../redux/slices/doctorApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";

export default function DoctorServicesScreen() {
  const { dt } = useDoctorTranslation();
  const { data: services = [], isLoading, refetch } = useGetDoctorServicesQuery();
  const [createService, { isLoading: creating }] = useCreateDoctorServiceMutation();
  const [deleteService] = useDeleteDoctorServiceMutation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");

  const handleCreate = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert(dt("error"), dt("error"));
      return;
    }
    try {
      await createService({
        name: name.trim(),
        price: price.trim(),
        durationMinutes: Number(durationMinutes) || 60,
      }).unwrap();
      setName("");
      setPrice("");
      await refetch();
    } catch {
      Alert.alert(dt("error"), dt("error"));
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
      <Text style={styles.title}>{dt("addConsultationService")}</Text>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder={dt("serviceName")} value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder={dt("servicePrice")} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <TextInput style={styles.input} placeholder={dt("durationMinutesLabel")} value={durationMinutes} onChangeText={setDurationMinutes} keyboardType="numeric" />
        <Pressable style={styles.primaryBtn} disabled={creating} onPress={handleCreate}>
          <Text style={styles.primaryBtnText}>{dt("addService")}</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>{dt("yourServices")}</Text>
      {services.length === 0 ? (
        <Text style={styles.empty}>{dt("noServicesYet")}</Text>
      ) : (
        services.map((service) => (
          <View key={service.id} style={styles.card}>
            <Text style={styles.cardTitle}>{service.name}</Text>
            <Text style={styles.cardPrice}>
              {service.currency} {service.price} · {service.durationMinutes} min
            </Text>
            <Pressable onPress={() => deleteService(service.id)}>
              <Text style={styles.delete}>{dt("deleteLabel")}</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  section: { fontWeight: "700", color: "#0f172a", marginTop: 8 },
  form: { gap: 10 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  primaryBtn: { backgroundColor: "#0f766e", borderRadius: 12, padding: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  cardTitle: { fontWeight: "700", color: "#0f172a" },
  cardPrice: { color: "#0f766e", marginTop: 4, fontWeight: "600" },
  delete: { color: "#dc2626", marginTop: 8, fontWeight: "600" },
  empty: { color: "#64748b", textAlign: "center", marginTop: 24 },
});
