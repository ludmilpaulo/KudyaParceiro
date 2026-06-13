import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useGetDoctorProfileQuery, useUpdateDoctorProfileMutation } from "../../redux/slices/doctorApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";

export default function DoctorProfileScreen() {
  const { dt } = useDoctorTranslation();
  const { data: profile, isLoading } = useGetDoctorProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateDoctorProfileMutation();
  const [form, setForm] = useState({
    clinicName: "",
    professionalTitle: "",
    biography: "",
    languages: "",
    yearsExperience: 0,
    licenseNumber: "",
    consultationFee: "",
    onlineConsultationEnabled: true,
    physicalConsultationEnabled: true,
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      clinicName: profile.clinicName,
      professionalTitle: profile.professionalTitle,
      biography: profile.biography,
      languages: profile.languages,
      yearsExperience: profile.yearsExperience,
      licenseNumber: profile.licenseNumber,
      consultationFee: profile.consultationFee,
      onlineConsultationEnabled: profile.onlineConsultationEnabled,
      physicalConsultationEnabled: profile.physicalConsultationEnabled,
    });
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile(form).unwrap();
      Alert.alert(dt("success"), dt("profileUpdated"));
    } catch {
      Alert.alert(dt("error"), dt("error"));
    }
  };

  if (isLoading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.muted}>{dt("loading")}</Text>
      </View>
    );
  }

  const fields: { key: keyof typeof form; label: string; keyboard?: "numeric" | "default" }[] = [
    { key: "clinicName", label: dt("clinicNameLabel") },
    { key: "professionalTitle", label: dt("professionalTitleLabel") },
    { key: "languages", label: dt("languagesLabel") },
    { key: "licenseNumber", label: dt("licenseNumberLabel") },
    { key: "consultationFee", label: dt("consultationFeeLabel"), keyboard: "numeric" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{dt("profile")}</Text>
      <Text style={styles.subtitle}>{dt("profileDescription")}</Text>

      {fields.map((field) => (
        <View key={field.key} style={styles.field}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            value={String(form[field.key])}
            keyboardType={field.keyboard}
            onChangeText={(value) => setForm((prev) => ({ ...prev, [field.key]: value }))}
          />
        </View>
      ))}

      <View style={styles.field}>
        <Text style={styles.label}>{dt("yearsExperienceLabel")}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(form.yearsExperience)}
          onChangeText={(value) => setForm((prev) => ({ ...prev, yearsExperience: Number(value) || 0 }))}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{dt("biographyLabel")}</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={4}
          value={form.biography}
          onChangeText={(value) => setForm((prev) => ({ ...prev, biography: value }))}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>{dt("onlineConsultation")}</Text>
        <Switch
          value={form.onlineConsultationEnabled}
          onValueChange={(value) => setForm((prev) => ({ ...prev, onlineConsultationEnabled: value }))}
          trackColor={{ true: "#0f766e" }}
        />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.label}>{dt("physicalConsultation")}</Text>
        <Switch
          value={form.physicalConsultationEnabled}
          onValueChange={(value) => setForm((prev) => ({ ...prev, physicalConsultationEnabled: value }))}
          trackColor={{ true: "#0f766e" }}
        />
      </View>

      <Pressable style={styles.primaryBtn} disabled={saving} onPress={handleSave}>
        <Text style={styles.primaryBtnText}>{saving ? dt("loading") : dt("saveProfile")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  muted: { color: "#64748b" },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#64748b", lineHeight: 20 },
  field: { gap: 6 },
  label: { color: "#475569", fontWeight: "600", fontSize: 13 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12 },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  primaryBtn: { backgroundColor: "#0f766e", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});
