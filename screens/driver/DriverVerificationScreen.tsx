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

import { useAppNavigation } from "../../navigation/hooks";
import { useSelector } from "react-redux";

import {
  useGetDriverVerificationStatusQuery,
  useSubmitDriverForReviewMutation,
} from "../../redux/slices/driverApi";
import { selectUser } from "../../redux/slices/authSlice";

import { useDriverTranslation } from "../../hooks/useDriverTranslation";

import { driverStatusLabel } from "../../configs/driverTranslations";



export default function DriverVerificationScreen() {

  const navigation = useAppNavigation();
  const authUser = useSelector(selectUser) as { username?: string; email?: string } | null;
  const { dt, languageCode } = useDriverTranslation();

  const { data: verification, isLoading, refetch } = useGetDriverVerificationStatusQuery(undefined, {

    pollingInterval: 30000,

  });

  const [submitForReview, { isLoading: submitting }] = useSubmitDriverForReviewMutation();

  const [message, setMessage] = useState<string | null>(null);



  const steps = useMemo(() => verification?.checklist ?? [], [verification]);



  const navigateForStep = (key: string) => {

    switch (key) {

      case "profile":

        navigation.navigate("UserProfile");

        break;

      case "id_document":

      case "drivers_licence":

      case "police_clearance":

        navigation.navigate("DriverDocuments", { tab: "personal" });

        break;

      case "vehicle_info":

        navigation.navigate("DriverVehicle");

        break;

      case "vehicle_documents":

      case "vehicle_photos":

        navigation.navigate("DriverDocuments", { tab: "vehicle" });

        break;

      default:

        break;

    }

  };



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

        <ActivityIndicator size="large" color="#0171CE" />

      </View>

    );

  }



  const statusLabel = driverStatusLabel(verification.verificationStatus, languageCode);

  const completion = verification.profileCompletionPercentage ?? 0;



  return (

    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.header}>
        <Text style={styles.title}>{dt("verificationRequired")}</Text>
        {authUser?.username ? (
          <Text style={styles.accountHint}>
            {dt("signedInAs")} {authUser.username}
            {authUser.email && authUser.email !== authUser.username ? ` (${authUser.email})` : ""}
          </Text>
        ) : null}
        <View style={styles.badge}>

          <Text style={styles.badgeText}>{statusLabel}</Text>

        </View>

      </View>



      <View style={styles.progressCard}>

        <Text style={styles.progressLabel}>

          {dt("profileProgress")}: {completion}%

        </Text>

        <View style={styles.progressTrack}>

          <View style={[styles.progressFill, { width: `${Math.min(completion, 100)}%` }]} />

        </View>

        <Pressable style={styles.linkButton} onPress={() => navigation.navigate("UserProfile")}>

          <Text style={styles.linkButtonText}>{dt("completeProfile")}</Text>

        </Pressable>

      </View>



      {verification.verificationStatus === "pending_verification" && (

        <View style={styles.infoCard}>

          <Text style={styles.infoTitle}>{dt("statusPendingReview")}</Text>

          <Text style={styles.infoBody}>{dt("underReviewMessage")}</Text>

        </View>

      )}

      {verification.verificationStatus === "approved" && (

        <View style={[styles.infoCard, styles.successCard]}>

          <Text style={styles.infoTitle}>{dt("statusApproved")}</Text>

          <Text style={styles.infoBody}>{dt("profileApproved")}</Text>

        </View>

      )}

      {verification.verificationStatus === "rejected" && (

        <View style={[styles.infoCard, styles.errorCard]}>

          <Text style={styles.infoTitle}>{dt("profileRejected")}</Text>

          {verification.rejectionReason ? (

            <Text style={styles.infoBody}>{verification.rejectionReason}</Text>

          ) : null}

        </View>

      )}



      <Text style={styles.sectionTitle}>{dt("submitForVerification")}</Text>

      {steps.map((step) => (

        <Pressable

          key={step.key}

          style={styles.stepRow}

          onPress={() => !step.done && navigateForStep(step.key)}

          disabled={step.done || step.key === "submit"}

        >

          <View style={[styles.stepDot, step.done && styles.stepDotDone]} />

          <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>

            {dt(step.labelKey as Parameters<typeof dt>[0])}

          </Text>

          {!step.done && step.key !== "submit" ? (

            <Text style={styles.stepAction}>→</Text>

          ) : null}

        </Pressable>

      ))}



      <Pressable

        style={styles.linkButton}

        onPress={() => navigation.navigate("DriverDocuments")}

      >

        <Text style={styles.linkButtonText}>{dt("uploadDocuments")}</Text>

      </Pressable>



      <Pressable

        style={styles.linkButton}

        onPress={() => navigation.navigate("DriverVehicle")}

      >

        <Text style={styles.linkButtonText}>{dt("addVehicleInformation")}</Text>

      </Pressable>



      {verification.canSubmitForReview && (

        <Pressable

          style={[styles.primaryButton, submitting && styles.disabled]}

          disabled={submitting}

          onPress={handleSubmit}

        >

          <Text style={styles.primaryButtonText}>{dt("submitForReview")}</Text>

        </Pressable>

      )}



      {message ? <Text style={styles.success}>{message}</Text> : null}

    </ScrollView>

  );

}



const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#f8fafc" },

  content: { padding: 20, paddingBottom: 100 },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: { marginBottom: 16 },
  accountHint: { fontSize: 12, color: "#64748b", marginTop: 4, marginBottom: 8 },

  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },

  badge: {

    alignSelf: "flex-start",

    marginTop: 8,

    backgroundColor: "#dbeafe",

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 999,

  },

  badgeText: { color: "#1d4ed8", fontWeight: "600", fontSize: 13 },

  progressCard: {

    backgroundColor: "#fff",

    borderRadius: 12,

    padding: 16,

    marginBottom: 16,

    borderWidth: 1,

    borderColor: "#e2e8f0",

  },

  progressLabel: { fontSize: 13, color: "#475569", marginBottom: 8, fontWeight: "600" },

  progressTrack: { height: 8, backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginBottom: 12 },

  progressFill: { height: "100%", backgroundColor: "#0171CE", borderRadius: 4 },

  infoCard: {

    backgroundColor: "#eff6ff",

    borderRadius: 12,

    padding: 16,

    marginBottom: 16,

    borderWidth: 1,

    borderColor: "#bfdbfe",

  },

  errorCard: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  successCard: { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" },

  infoTitle: { fontWeight: "700", color: "#0f172a", marginBottom: 6 },

  infoBody: { color: "#475569", lineHeight: 20 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#0f172a" },

  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, paddingVertical: 4 },

  stepDot: {

    width: 12,

    height: 12,

    borderRadius: 6,

    borderWidth: 2,

    borderColor: "#94a3b8",

    marginRight: 10,

  },

  stepDotDone: { backgroundColor: "#0171CE", borderColor: "#0171CE" },

  stepLabel: { color: "#64748b", flex: 1 },

  stepLabelDone: { color: "#0f172a", fontWeight: "600" },

  stepAction: { color: "#0171CE", fontWeight: "700", fontSize: 16 },

  linkButton: {

    marginTop: 12,

    padding: 14,

    borderRadius: 12,

    backgroundColor: "#fff",

    borderWidth: 1,

    borderColor: "#e2e8f0",

  },

  linkButtonText: { color: "#0171CE", fontWeight: "600", textAlign: "center" },

  primaryButton: {

    marginTop: 20,

    backgroundColor: "#0171CE",

    paddingVertical: 14,

    borderRadius: 12,

    alignItems: "center",

  },

  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  disabled: { opacity: 0.6 },

  success: { marginTop: 12, color: "#047857", textAlign: "center" },

});


