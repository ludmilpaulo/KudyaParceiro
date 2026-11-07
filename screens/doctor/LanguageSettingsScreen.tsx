import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { detectDeviceLanguage, localeLabels, type SupportedLocale } from "../../configs/i18n";
import { useLanguage } from "../../contexts/LanguageContext";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import { useUpdateLanguagePreferenceMutation } from "../../redux/slices/languageApi";

const MODE_KEY = "@kudya-parceiro/language_mode";
const PRIMARY: SupportedLocale[] = ["en", "pt", "fr"];

type Props = {
  propertyPreview?: boolean;
};

export default function LanguageSettingsScreen({ propertyPreview = false }: Props) {
  const { dt } = useDoctorTranslation();
  const { pt } = usePropertyTranslation();
  const { languageCode, setLanguage, supportedLocales } = useLanguage();
  const [updateLanguage] = useUpdateLanguagePreferenceMutation();
  const [mode, setMode] = useState<"auto" | "manual">("manual");

  useEffect(() => {
    if (!propertyPreview) return;
    void AsyncStorage.getItem(MODE_KEY).then((value) => {
      if (value === "auto") setMode("auto");
    });
  }, [propertyPreview]);

  const selectLanguage = async (code: SupportedLocale, nextMode: "auto" | "manual") => {
    if (propertyPreview) {
      setMode(nextMode);
      await AsyncStorage.setItem(MODE_KEY, nextMode);
    }
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

  const accent = propertyPreview ? "#5b21b6" : "#0f766e";
  const activeBg = propertyPreview ? "#ede9fe" : "#ecfeff";
  const ordered = propertyPreview
    ? [...PRIMARY, ...supportedLocales.filter((code) => !PRIMARY.includes(code))]
    : [...supportedLocales];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{dt("languageSettings")}</Text>
      <Text style={styles.subtitle}>{dt("preferredLanguage")}</Text>
      <View style={propertyPreview ? styles.card : undefined}>
        {propertyPreview ? (
          <Pressable
            style={[styles.row, mode === "auto" && { borderColor: accent, backgroundColor: activeBg }]}
            onPress={() => void selectLanguage(detectDeviceLanguage(), "auto")}
          >
            <Text style={[styles.rowText, mode === "auto" && { fontWeight: "700", color: accent }]}>
              {pt("languageAutomatic")}
            </Text>
            {mode === "auto" ? <Text style={[styles.check, { color: accent }]}>✓</Text> : null}
          </Pressable>
        ) : null}
        {ordered.map((code) => {
          const active = propertyPreview ? mode === "manual" && languageCode === code : languageCode === code;
          return (
            <Pressable
              key={code}
              style={[styles.row, active && { borderColor: accent, backgroundColor: activeBg }]}
              onPress={() => void selectLanguage(code, "manual")}
            >
              <Text style={[styles.rowText, active && { fontWeight: "700", color: accent }]}>
                {localeLabels[code]}
              </Text>
              {active ? <Text style={[styles.check, { color: accent }]}>✓</Text> : null}
            </Pressable>
          );
        })}
        {propertyPreview ? <Text style={styles.preview}>{pt("languagePreviewLine")}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 10 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#64748b", marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ede9fe",
    padding: 8,
    gap: 8,
  },
  preview: {
    marginTop: 4,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#ede9fe",
    color: "#475569",
    fontSize: 14,
  },
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
  rowText: { color: "#0f172a", fontSize: 16 },
  check: { fontWeight: "700", fontSize: 18 },
});
