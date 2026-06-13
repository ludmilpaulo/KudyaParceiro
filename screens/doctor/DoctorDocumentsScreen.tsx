import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  useDeleteDoctorDocumentMutation,
  useGetDoctorDocumentsQuery,
  useUploadDoctorDocumentMutation,
} from "../../redux/slices/doctorApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";
import type { DoctorDocumentType } from "../../types/doctor";
import { REQUIRED_DOCTOR_DOCUMENTS } from "../../types/doctor";

const DOC_TYPES: DoctorDocumentType[] = [
  ...REQUIRED_DOCTOR_DOCUMENTS.map((d) => d.type),
  "other",
];

export default function DoctorDocumentsScreen() {
  const { dt } = useDoctorTranslation();
  const { data: documents = [], isLoading, refetch } = useGetDoctorDocumentsQuery();
  const [uploadDocument, { isLoading: uploading }] = useUploadDoctorDocumentMutation();
  const [deleteDocument] = useDeleteDoctorDocumentMutation();
  const [selectedType, setSelectedType] = useState<DoctorDocumentType>("id_document");

  const docLabel = (type: DoctorDocumentType) => {
    const found = REQUIRED_DOCTOR_DOCUMENTS.find((d) => d.type === type);
    if (found) return dt(found.labelKey as Parameters<typeof dt>[0]);
    return dt("docOther");
  };

  const pickAndUpload = async (source: "camera" | "file") => {
    try {
      let uri = "";
      let name = "document";
      let mime = "application/octet-stream";

      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(dt("error"), "Camera permission required.");
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (result.canceled || !result.assets[0]) return;
        uri = result.assets[0].uri;
        name = `${selectedType}.jpg`;
        mime = "image/jpeg";
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(dt("error"), "Gallery permission required.");
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          allowsMultipleSelection: false,
        });
        if (result.canceled || !result.assets[0]) return;
        uri = result.assets[0].uri;
        name = result.assets[0].fileName ?? `${selectedType}.jpg`;
        mime = result.assets[0].mimeType ?? "image/jpeg";
      }

      await uploadDocument({
        documentType: selectedType,
        file: { uri, name, type: mime },
      }).unwrap();
      await refetch();
      Alert.alert(dt("success"), dt("uploadDocuments"));
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail;
      Alert.alert(dt("error"), detail || dt("error"));
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(dt("error"), "Delete document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDocument(id);
          await refetch();
        },
      },
    ]);
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
      <Text style={styles.title}>{dt("uploadDocuments")}</Text>
      <Text style={styles.subtitle}>{dt("selectDocumentType")}</Text>

      <View style={styles.chips}>
        {DOC_TYPES.map((type) => (
          <Pressable
            key={type}
            style={[styles.chip, selectedType === type && styles.chipActive]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[styles.chipText, selectedType === type && styles.chipTextActive]}>
              {docLabel(type)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} disabled={uploading} onPress={() => pickAndUpload("file")}>
          <Text style={styles.primaryBtnText}>{dt("chooseFile")}</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} disabled={uploading} onPress={() => pickAndUpload("camera")}>
          <Text style={styles.secondaryBtnText}>{dt("camera")}</Text>
        </Pressable>
      </View>

      {documents.map((doc) => (
        <View key={doc.id} style={styles.docCard}>
          <Text style={styles.docType}>{docLabel(doc.documentType)}</Text>
          <Text style={styles.docName}>{doc.originalFilename}</Text>
          <Pressable onPress={() => handleDelete(doc.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#64748b" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: "#0f766e", borderColor: "#0f766e" },
  chipText: { color: "#475569", fontSize: 12 },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10 },
  primaryBtn: { flex: 1, backgroundColor: "#0f766e", borderRadius: 12, padding: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: "#0f766e", borderRadius: 12, padding: 14, alignItems: "center" },
  secondaryBtnText: { color: "#0f766e", fontWeight: "700" },
  docCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  docType: { fontWeight: "700", color: "#0f172a" },
  docName: { color: "#64748b", marginTop: 4 },
  deleteText: { color: "#dc2626", marginTop: 8, fontWeight: "600" },
});
