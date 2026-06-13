import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";
import type { DoctorStackParamList } from "../../navigation/doctorTypes";

type Props = NativeStackScreenProps<DoctorStackParamList, "DoctorSlotPreview">;

export default function DoctorSlotPreviewScreen({ route }: Props) {
  const { dt } = useDoctorTranslation();
  const { dayLabel, slots } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{dt("slotPreviewTitle")}</Text>
      <Text style={styles.subtitle}>{dayLabel}</Text>
      <Text style={styles.rules}>{dt("slotRules")}</Text>

      {slots.length === 0 ? (
        <Text style={styles.empty}>{dt("previewBeforeSave")}</Text>
      ) : (
        slots.map((slot) => (
          <View key={`${slot.startTime}-${slot.endTime}`} style={styles.slotCard}>
            <Text style={styles.slotText}>
              {slot.startTime} – {slot.endTime}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#0f766e", fontWeight: "600" },
  rules: { color: "#64748b", lineHeight: 20 },
  empty: { color: "#64748b", marginTop: 16 },
  slotCard: { backgroundColor: "#ecfeff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#99f6e4" },
  slotText: { color: "#0f766e", fontWeight: "700", fontSize: 16 },
});
