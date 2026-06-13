import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useGetDoctorVerificationStatusQuery,
  useSubmitDoctorForReviewMutation,
} from "../../redux/slices/doctorApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";
import { verificationStatusLabel } from "../../configs/doctorTranslations";
import { REQUIRED_DOCTOR_DOCUMENTS } from "../../types/doctor";
import { useGetDoctorDocumentsQuery } from "../../redux/slices/doctorApi";

export default function DoctorVerificationScreen() {
  const { dt, languageCode } = useDoctorTranslation();
  const { data: verification, isLoading, refetch } = useGetDoctorVerificationStatusQuery();
  const { data: documents = [] } = useGetDoctorDocumentsQuery();
  const [submitForReview, { isLoading: submitting }] = useSubmitDoctorForReviewMutation();
  const [message, setMessage] = useState<string | null>(null);

  const uploadedTypes = useMemo(() => new Set(documents.map((d) => d.documentType)), [documents]);

  const steps = useMemo(() => {
    if (!verification) return [];
    return [
      {
        key: "profile",
        label: dt("profile"),
        done: verification.profileCompletionPercentage >= 60,
      },
      ...REQUIRED_DOCTOR_DOCUMENTS.map((item) => ({
        key: item.type,
        label: dt(item.labelKey as Parameters<typeof dt>[0]),
        done: uploadedTypes.has(item.type),
      })),
      {
        key: "submit",
        label: dt("submitForReview"),
        done: ["pending_review", "approved"].includes(verification.verificationStatus),
      },
    ];
  }, [verification, uploadedTypes, dt]);

  const handleSubmit = async () => {
    setMessage(null);
    try {
      await submitForReview().unwrap();
      setMessage(dt("success"));
      await refetch();
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail;
      Alert.alert(dt("error"), detail || dt("error"));
    }
  };

  if (isLoading || !verification) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  const status = verification.verificationStatus;
  const statusLabel = verificationStatusLabel(status, languageCode);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{dt("verificationRequired")}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      </View>

      {status === "pending_review" && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{dt("statusPendingReview")}</Text>
          <Text style={styles.infoBody}>{dt("underReviewMessage")}</Text>
        </View>
      )}

      {status === "rejected" && (
        <View style={[styles.infoCard, styles.errorCard]}>
          <Text style={styles.infoTitle}>{dt("profileRejected")}</Text>
          {verification.rejectionReason ? (
            <Text style={styles.infoBody}>{verification.rejectionReason}</Text>
          ) : null}
          {verification.adminNotes ? (
            <Text style={styles.adminNotes}>{dt("adminFeedback")}: {verification.adminNotes}</Text>
          ) : null}
        </View>
      )}

      {status === "suspended" && (
        <View style={[styles.infoCard, styles.warnCard]}>
          <Text style={styles.infoTitle}>{dt("statusSuspended")}</Text>
          <Text style={styles.infoBody}>{dt("suspendedMessage")}</Text>
        </View>
      )}

      {(status === "draft" || status === "rejected") && (
        <>
          <Text style={styles.sectionTitle}>{dt("verificationProgress")}</Text>
          {steps.map((step) => (
            <View key={step.key} style={styles.stepRow}>
              <View style={[styles.stepDot, step.done && styles.stepDotDone]} />
              <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
            </View>
          ))}

          {verification.canSubmitForReview && (
            <Pressable
              style={[styles.primaryBtn, submitting && styles.btnDisabled]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryBtnText}>{dt("submitForReview")}</Text>
            </Pressable>
          )}
        </>
      )}

      {message ? <Text style={styles.success}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { alignItems: "center", gap: 12, paddingVertical: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", textAlign: "center" },
  badge: { backgroundColor: "#ccfbf1", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: "#0f766e", fontWeight: "700" },
  infoCard: { backgroundColor: "#ecfeff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#99f6e4" },
  errorCard: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  warnCard: { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },
  infoTitle: { fontWeight: "700", color: "#0f172a", fontSize: 16 },
  infoBody: { color: "#475569", marginTop: 6, lineHeight: 20 },
  adminNotes: { color: "#64748b", marginTop: 8, fontStyle: "italic" },
  sectionTitle: { fontWeight: "700", color: "#0f172a", fontSize: 16 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#cbd5e1" },
  stepDotDone: { backgroundColor: "#0f766e" },
  stepLabel: { color: "#64748b", flex: 1 },
  stepLabelDone: { color: "#0f172a", fontWeight: "600" },
  primaryBtn: { backgroundColor: "#0f766e", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  success: { color: "#0f766e", textAlign: "center", fontWeight: "600" },
});
