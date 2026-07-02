import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  useGetDriverPersonalDocumentsQuery,
  useGetDriverVehicleDocumentsQuery,
  useUploadDriverPersonalDocumentMutation,
  useUploadDriverVehicleDocumentMutation,
} from "../../redux/slices/driverApi";
import { useDriverTranslation } from "../../hooks/useDriverTranslation";
import type { DriverDocumentRecord } from "../../types/driverVerification";
import { REQUIRED_PERSONAL_DOCUMENTS, REQUIRED_VEHICLE_DOCUMENTS } from "../../types/driverVerification";

type UploadSource = "camera" | "gallery" | "file";

function formatUploadDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function docsByType(docs: DriverDocumentRecord[]): Map<string, DriverDocumentRecord> {
  const map = new Map<string, DriverDocumentRecord>();
  for (const doc of docs) {
    if (!map.has(doc.documentType)) {
      map.set(doc.documentType, doc);
    }
  }
  return map;
}

function isPhotoDocumentType(documentType: string): boolean {
  return documentType === "profile_photo" || documentType.startsWith("photo_");
}

export default function DriverDocumentsScreen() {
  const { dt } = useDriverTranslation();
  const route = useRoute<{ params?: { tab?: "personal" | "vehicle" } }>();
  const initialTab = route.params?.tab === "vehicle" ? "vehicle" : "personal";
  const { data: personalDocs = [], isLoading: loadingPersonal } = useGetDriverPersonalDocumentsQuery();
  const { data: vehicleDocs = [], isLoading: loadingVehicle } = useGetDriverVehicleDocumentsQuery();
  const [uploadPersonal] = useUploadDriverPersonalDocumentMutation();
  const [uploadVehicle] = useUploadDriverVehicleDocumentMutation();
  const [tab, setTab] = useState<"personal" | "vehicle">(initialTab);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [highlightedType, setHighlightedType] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!highlightedType) return;
    const timer = setTimeout(() => setHighlightedType(null), 3000);
    return () => clearTimeout(timer);
  }, [highlightedType]);

  const personalByType = useMemo(() => docsByType(personalDocs), [personalDocs]);
  const vehicleByType = useMemo(() => docsByType(vehicleDocs), [vehicleDocs]);

  const verificationLabel = (status: string) => {
    switch (status) {
      case "approved":
        return dt("docApproved");
      case "rejected":
        return dt("docRejected");
      default:
        return dt("docPendingReview");
    }
  };

  const pickFile = async (): Promise<{ uri: string; name: string; type: string } | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.name ?? "document",
      type: asset.mimeType ?? "application/octet-stream",
    };
  };

  const pickFromCamera = async (documentType: string): Promise<{ uri: string; name: string; type: string } | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(dt("error"), dt("cameraPermissionRequired"));
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (result.canceled || !result.assets[0]) return null;
    return {
      uri: result.assets[0].uri,
      name: `${documentType}.jpg`,
      type: "image/jpeg",
    };
  };

  const pickFromGallery = async (documentType: string): Promise<{ uri: string; name: string; type: string } | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(dt("error"), dt("galleryPermissionRequired"));
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsMultipleSelection: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (result.canceled || !result.assets[0]) return null;
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName ?? `${documentType}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
    };
  };

  const uploadFromSource = async (
    source: UploadSource,
    documentType: string,
    scope: "personal" | "vehicle",
    labelKey: string,
  ) => {
    try {
      let file: { uri: string; name: string; type: string } | null = null;
      if (source === "camera") file = await pickFromCamera(documentType);
      else if (source === "gallery") file = await pickFromGallery(documentType);
      else file = await pickFile();

      if (!file) return;

      setUploadingDocType(documentType);
      if (scope === "personal") {
        await uploadPersonal({ documentType, file }).unwrap();
      } else {
        await uploadVehicle({ documentType, file }).unwrap();
      }

      const docLabel = dt(labelKey as Parameters<typeof dt>[0]);
      setSuccessMessage(`${dt("documentUploadedSuccess")}: ${docLabel} (${file.name})`);
      setHighlightedType(documentType);
    } catch (err: unknown) {
      const rtk = err as { data?: { detail?: string; code?: string }; status?: number; error?: string };
      const detail = rtk?.data?.detail;
      const isAuthError =
        rtk?.status === 401 ||
        rtk?.data?.code === "token_not_valid" ||
        (typeof detail === "string" && detail.toLowerCase().includes("token"));
      Alert.alert(dt("error"), isAuthError ? dt("sessionExpired") : detail || rtk?.error || dt("error"));
    } finally {
      setUploadingDocType(null);
    }
  };

  const showUploadOptions = (documentType: string, scope: "personal" | "vehicle", labelKey: string) => {
    const docLabel = dt(labelKey as Parameters<typeof dt>[0]);
    const photoOnly = isPhotoDocumentType(documentType);

    const options: { text: string; onPress?: () => void; style?: "cancel" }[] = [
      { text: dt("takePhoto"), onPress: () => uploadFromSource("camera", documentType, scope, labelKey) },
      { text: dt("chooseFromGallery"), onPress: () => uploadFromSource("gallery", documentType, scope, labelKey) },
    ];

    if (!photoOnly) {
      options.push({
        text: dt("chooseFile"),
        onPress: () => uploadFromSource("file", documentType, scope, labelKey),
      });
    }

    options.push({ text: dt("cancel"), style: "cancel" });
    Alert.alert(dt("uploadDocuments"), docLabel, options);
  };

  if (loadingPersonal || loadingVehicle) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0171CE" />
      </View>
    );
  }

  const items = tab === "personal" ? REQUIRED_PERSONAL_DOCUMENTS : REQUIRED_VEHICLE_DOCUMENTS;
  const docMap = tab === "personal" ? personalByType : vehicleByType;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {successMessage ? (
        <View style={styles.successBanner} accessibilityRole="alert">
          <Ionicons name="checkmark-circle" size={22} color="#15803d" />
          <Text style={styles.successBannerText}>{successMessage}</Text>
          <Pressable accessibilityLabel="Dismiss" hitSlop={8} onPress={() => setSuccessMessage(null)}>
            <Ionicons name="close" size={20} color="#15803d" />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === "personal" && styles.tabActive]} onPress={() => setTab("personal")}>
          <Text style={[styles.tabText, tab === "personal" && styles.tabTextActive]}>{dt("personalDocuments")}</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === "vehicle" && styles.tabActive]} onPress={() => setTab("vehicle")}>
          <Text style={[styles.tabText, tab === "vehicle" && styles.tabTextActive]}>{dt("vehicleDocuments")}</Text>
        </Pressable>
      </View>

      {items.map((item) => {
        const record = docMap.get(item.type);
        const isUploaded = Boolean(record);
        const isUploading = uploadingDocType === item.type;
        const isHighlighted = highlightedType === item.type;

        return (
          <View
            key={item.type}
            style={[styles.card, isUploaded && styles.cardUploaded, isHighlighted && styles.cardHighlighted]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{dt(item.labelKey)}</Text>
              {isUploaded ? (
                <View style={styles.uploadedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                  <Text style={styles.uploadedBadgeText}>{dt("uploaded")}</Text>
                </View>
              ) : (
                <Text style={styles.requiredBadge}>{dt("required")}</Text>
              )}
            </View>

            {record ? (
              <View style={styles.fileInfo}>
                <Ionicons name="document-text-outline" size={18} color="#64748b" />
                <View style={styles.fileInfoText}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {record.originalFilename || record.documentTypeLabel}
                  </Text>
                  <Text style={styles.fileMeta}>
                    {dt("uploadedOn")} {formatUploadDate(record.uploadedAt)}
                    {" · "}
                    {verificationLabel(record.verificationStatus)}
                  </Text>
                  {record.verificationStatus === "rejected" && record.rejectionReason ? (
                    <Text style={styles.rejectionReason}>{record.rejectionReason}</Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <Pressable
              style={[styles.button, isUploaded && styles.buttonUploaded, isUploading && styles.buttonUploading]}
              disabled={Boolean(uploadingDocType)}
              onPress={() => showUploadOptions(item.type, tab, item.labelKey)}
            >
              {isUploading ? (
                <View style={styles.buttonRow}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.buttonText}>{dt("uploading")}</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>{isUploaded ? dt("replaceFile") : dt("selectFile")}</Text>
              )}
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successBannerText: { flex: 1, color: "#15803d", fontWeight: "600", fontSize: 14 },
  tabs: { flexDirection: "row", marginBottom: 16, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#0171CE" },
  tabText: { fontWeight: "600", color: "#475569" },
  tabTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardUploaded: { borderColor: "#86efac" },
  cardHighlighted: { backgroundColor: "#f0fdf4" },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: { flex: 1, fontWeight: "700", color: "#0f172a" },
  uploadedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  uploadedBadgeText: { color: "#15803d", fontWeight: "700", fontSize: 12 },
  requiredBadge: { color: "#b45309", fontWeight: "600", fontSize: 12 },
  fileInfo: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "flex-start" },
  fileInfoText: { flex: 1 },
  fileName: { color: "#0f172a", fontWeight: "600", fontSize: 13 },
  fileMeta: { color: "#64748b", fontSize: 12, marginTop: 2 },
  rejectionReason: { color: "#dc2626", fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: "#0171CE",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonUploaded: { backgroundColor: "#15803d" },
  buttonUploading: { opacity: 0.85 },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
