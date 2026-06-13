import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { localeLabels, type SupportedLocale } from "../../configs/i18n";
import { useLanguage } from "../../contexts/LanguageContext";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";
import { useUpdateLanguagePreferenceMutation } from "../../redux/slices/languageApi";
import { detectDeviceLanguage } from "../../configs/i18n";

export default function LanguageSettingsScreen() {
  const { dt } = useDoctorTranslation();
  const { languageCode, setLanguage, supportedLocales } = useLanguage();
  const [updateLanguage] = useUpdateLanguagePreferenceMutation();

  const selectLanguage = async (code: SupportedLocale) => {
    await setLanguage(code);
    try {
      await updateLanguage({
        preferredLanguage: code,
        systemLanguage: detectDeviceLanguage(),
      }).unwrap();
    } catch {
      // Local language still applies if backend sync fails offline.
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{dt("languageSettings")}</Text>
      <Text style={styles.subtitle}>{dt("preferredLanguage")}</Text>

      {supportedLocales.map((code) => (
        <Pressable
          key={code}
          style={[styles.row, languageCode === code && styles.rowActive]}
          onPress={() => selectLanguage(code)}
        >
          <Text style={[styles.rowText, languageCode === code && styles.rowTextActive]}>
            {localeLabels[code]}
          </Text>
          {languageCode === code ? <Text style={styles.check}>✓</Text> : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 10 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#64748b", marginBottom: 8 },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowActive: { borderColor: "#0f766e", backgroundColor: "#ecfeff" },
  rowText: { color: "#0f172a", fontSize: 16 },
  rowTextActive: { fontWeight: "700", color: "#0f766e" },
  check: { color: "#0f766e", fontWeight: "700", fontSize: 18 },
});
