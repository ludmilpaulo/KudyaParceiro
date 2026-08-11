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
import { useRoute, type RouteProp } from "@react-navigation/native";
import {
  useApprovePropertyApplicationMutation,
  useCompletePropertyViewingMutation,
  useGeneratePropertyLeaseMutation,
  useGetPropertyApplicationQuery,
  useProposePropertyViewingMutation,
  useRejectApplicationDocumentMutation,
  useRejectPropertyApplicationMutation,
  useReviewPropertyApplicationMutation,
  useSignPropertyLeaseMutation,
  useVerifyApplicationDocumentMutation,
} from "../../redux/slices/propertyApi";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import type { PropertyLease, PropertyViewingInput } from "../../types/property";
import { propertyTheme } from "../../components/property/propertyUi";

type DetailRoute = RouteProp<{ PropertyApplicationDetail: { applicationId: number } }, "PropertyApplicationDetail">;

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unable to complete this action.";

function valueOrDash(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

export default function PropertyApplicationDetailScreen() {
  const route = useRoute<DetailRoute>();
  const { pt, languageCode } = usePropertyTranslation();
  const applicationId = route.params.applicationId;
  const { data: application, isLoading, isError, refetch } = useGetPropertyApplicationQuery(applicationId);
  const [review] = useReviewPropertyApplicationMutation();
  const [approve] = useApprovePropertyApplicationMutation();
  const [reject] = useRejectPropertyApplicationMutation();
  const [proposeViewing] = useProposePropertyViewingMutation();
  const [completeViewing] = useCompletePropertyViewingMutation();
  const [verifyDocument] = useVerifyApplicationDocumentMutation();
  const [rejectDocument] = useRejectApplicationDocumentMutation();
  const [generateLease] = useGeneratePropertyLeaseMutation();
  const [signLease] = useSignPropertyLeaseMutation();
  const [specialConditions, setSpecialConditions] = useState("");
  const [proposedRent, setProposedRent] = useState("");
  const [proposedDeposit, setProposedDeposit] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [documentReason, setDocumentReason] = useState("");
  const [viewing, setViewing] = useState<PropertyViewingInput>({ scheduledAt: "", location: "", notes: "" });
  const [signatureName, setSignatureName] = useState("");
  const [busy, setBusy] = useState(false);

  const perform = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      Alert.alert(success);
      await refetch();
    } catch (error) {
      Alert.alert(pt("applicationActionFailed"), errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color={propertyTheme.primary} /></View>;
  if (isError || !application) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{pt("applicationLoadError")}</Text>
        <Pressable style={styles.primaryButton} onPress={() => void refetch()}><Text style={styles.primaryButtonText}>{pt("tryAgain")}</Text></Pressable>
      </View>
    );
  }

  const canReview = application.status === "submitted";
  const canDecide = application.status === "under_review" || application.status === "viewing_completed";
  const canGenerateLease = application.status === "documents_verified";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{pt("applicationDetails")}</Text>
      <View style={styles.statusRow}>
        <Text style={styles.propertyTitle}>{application.propertyTitle}</Text>
        <Text style={styles.status}>{application.status.replace(/_/g, " ")}</Text>
      </View>

      <Section title={pt("applicationApplicant")}>
        <Info label={pt("applicationName")} value={application.fullName} />
        <Info label={pt("applicationEmail")} value={application.email} />
        <Info label={pt("applicationPhone")} value={application.phone} />
        <Info label={pt("applicationEmployment")} value={`${valueOrDash(application.employmentStatus)} · ${valueOrDash(application.occupation)}`} />
        <Info label={pt("applicationAddress")} value={application.currentAddress} />
        <Info label={pt("applicationOccupants")} value={`${valueOrDash(application.adults)} ${pt("applicationAdults")} · ${valueOrDash(application.children)} ${pt("applicationChildren")}`} />
      </Section>

      <Section title={pt("applicationRental")}>
        <Info label={pt("applicationMoveIn")} value={application.moveInDate} />
        <Info label={pt("applicationPeriod")} value={application.rentalPeriodMonths} />
        <Info label={pt("applicationRent")} value={application.proposedRent ? `${application.currency} ${application.proposedRent}` : null} />
        <Info label={pt("applicationDeposit")} value={application.proposedDeposit ? `${application.currency} ${application.proposedDeposit}` : null} />
        {application.additionalNotes ? <Text style={styles.notes}>{application.additionalNotes}</Text> : null}
      </Section>

      {canReview ? (
        <ActionButton label={pt("applicationStartReview")} busy={busy} onPress={() => void perform(() => review(application.id).unwrap(), pt("applicationReviewStarted"))} />
      ) : null}

      {canDecide ? (
        <Section title={pt("applicationDecision")}>
          <TextInput value={proposedRent} onChangeText={setProposedRent} keyboardType="decimal-pad" placeholder={pt("applicationProposedRent")} placeholderTextColor={propertyTheme.textMuted} style={styles.input} />
          <TextInput value={proposedDeposit} onChangeText={setProposedDeposit} keyboardType="decimal-pad" placeholder={pt("applicationProposedDeposit")} placeholderTextColor={propertyTheme.textMuted} style={styles.input} />
          <TextInput value={specialConditions} onChangeText={setSpecialConditions} placeholder={pt("applicationSpecialConditions")} placeholderTextColor={propertyTheme.textMuted} style={[styles.input, styles.multiline]} multiline />
          <ActionButton
            label={pt("applicationApprove")}
            busy={busy}
            onPress={() => void perform(
              () => approve({ id: application.id, body: {
                ...(specialConditions ? { specialConditions } : {}),
                ...(proposedRent ? { proposedRent } : {}),
                ...(proposedDeposit ? { proposedDeposit } : {}),
              } }).unwrap(),
              pt("applicationApproved"),
            )}
          />
          <TextInput value={rejectionReason} onChangeText={setRejectionReason} placeholder={pt("applicationRejectionReason")} placeholderTextColor={propertyTheme.textMuted} style={styles.input} />
          <ActionButton
            label={pt("applicationReject")}
            danger
            busy={busy}
            onPress={() => {
              if (!rejectionReason.trim()) return Alert.alert(pt("fillAllFields"));
              return void perform(() => reject({ id: application.id, reason: rejectionReason.trim() }).unwrap(), pt("applicationRejected"));
            }}
          />
        </Section>
      ) : null}

      <Section title={pt("applicationViewings")}>
        {application.viewings.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemTitle}>{item.location || pt("applicationViewing")}</Text>
            <Text style={styles.itemMeta}>{valueOrDash(item.scheduledAt)} · {item.status}</Text>
            {item.status !== "completed" ? (
              <Pressable style={styles.outlineButton} onPress={() => void perform(
                () => completeViewing({ applicationId: application.id, viewingId: item.id }).unwrap(),
                pt("applicationViewingCompleted"),
              )}>
                <Text style={styles.outlineButtonText}>{pt("applicationCompleteViewing")}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        {(application.status === "under_review" || application.status === "viewing_required") ? (
          <>
            <TextInput value={viewing.scheduledAt} onChangeText={(scheduledAt) => setViewing((current) => ({ ...current, scheduledAt }))} placeholder={pt("applicationViewingDateHint")} placeholderTextColor={propertyTheme.textMuted} style={styles.input} />
            <TextInput value={viewing.location} onChangeText={(location) => setViewing((current) => ({ ...current, location }))} placeholder={pt("applicationViewingLocation")} placeholderTextColor={propertyTheme.textMuted} style={styles.input} />
            <TextInput value={viewing.notes} onChangeText={(notes) => setViewing((current) => ({ ...current, notes }))} placeholder={pt("applicationViewingNotes")} placeholderTextColor={propertyTheme.textMuted} style={styles.input} />
            <ActionButton label={pt("applicationProposeViewing")} busy={busy} onPress={() => {
              if (!viewing.scheduledAt || !viewing.location) return Alert.alert(pt("fillAllFields"));
              return void perform(() => proposeViewing({ id: application.id, body: viewing }).unwrap(), pt("applicationViewingProposed"));
            }} />
          </>
        ) : null}
      </Section>

      <Section title={pt("applicationDocuments")}>
        {application.documents.length === 0 ? <Text style={styles.muted}>{pt("applicationNoDocuments")}</Text> : null}
        {application.documents.map((document) => (
          <View key={document.id} style={styles.item}>
            <Text style={styles.itemTitle}>{document.originalFilename || document.documentType}</Text>
            <Text style={styles.itemMeta}>{document.status}</Text>
            {document.status === "uploaded" || document.status === "under_review" ? (
              <>
                <Pressable style={styles.outlineButton} onPress={() => void perform(
                  () => verifyDocument({ applicationId: application.id, documentId: document.id }).unwrap(),
                  pt("applicationDocumentVerified"),
                )}><Text style={styles.outlineButtonText}>{pt("applicationVerifyDocument")}</Text></Pressable>
                <TextInput value={documentReason} onChangeText={setDocumentReason} placeholder={pt("applicationDocumentReason")} placeholderTextColor={propertyTheme.textMuted} style={styles.input} />
                <ActionButton label={pt("applicationRejectDocument")} danger busy={busy} onPress={() => {
                  if (!documentReason.trim()) return Alert.alert(pt("fillAllFields"));
                  return void perform(() => rejectDocument({ applicationId: application.id, documentId: document.id, reason: documentReason.trim() }).unwrap(), pt("applicationDocumentRejected"));
                }} />
              </>
            ) : null}
          </View>
        ))}
      </Section>

      <Section title={pt("applicationLease")}>
        {application.leases.map((lease) => <LeaseCard key={lease.id} lease={lease} signatureName={signatureName} setSignatureName={setSignatureName} busy={busy} onSign={() => void perform(() => signLease({ id: lease.id, signatureName }).unwrap(), pt("applicationLeaseSigned"))} />)}
        {canGenerateLease ? <ActionButton label={pt("applicationGenerateLease")} busy={busy} onPress={() => void perform(() => generateLease({ applicationId: application.id, language: languageCode }).unwrap(), pt("applicationLeaseGenerated"))} /> : null}
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}
function Info({ label, value }: { label: string; value: string | number | null | undefined }) {
  return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{valueOrDash(value)}</Text></View>;
}
function ActionButton({ label, onPress, busy, danger = false }: { label: string; onPress: () => void; busy: boolean; danger?: boolean }) {
  return <Pressable disabled={busy} onPress={onPress} style={[styles.actionButton, danger && styles.dangerButton, busy && styles.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>{label}</Text>}</Pressable>;
}
function LeaseCard({ lease, signatureName, setSignatureName, onSign, busy }: { lease: PropertyLease; signatureName: string; setSignatureName: (value: string) => void; onSign: () => void; busy: boolean }) {
  const { pt } = usePropertyTranslation();
  const ownerSignature = lease.signatures.find((signature) => signature.role === "owner");
  return <View style={styles.item}><Text style={styles.itemTitle}>{pt("applicationLease")} · {lease.language.toUpperCase()}</Text><Text style={styles.itemMeta}>{lease.status} · {lease.currency} {lease.monthlyRent}</Text>{ownerSignature?.isSigned ? <Text style={styles.success}>{pt("applicationLeaseSigned")}</Text> : <><TextInput value={signatureName} onChangeText={setSignatureName} placeholder={pt("applicationSignatureName")} placeholderTextColor={propertyTheme.textMuted} style={styles.input} /><ActionButton label={pt("applicationSignLease")} busy={busy} onPress={onSign} /></>}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: propertyTheme.background },
  content: { padding: 16, paddingBottom: 40, maxWidth: 900, width: "100%", alignSelf: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 26, fontWeight: "800", color: propertyTheme.text },
  statusRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 8, marginBottom: 16 },
  propertyTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: propertyTheme.text },
  status: { color: propertyTheme.primary, fontWeight: "800", fontSize: 12, textTransform: "capitalize" },
  section: { backgroundColor: "#fff", borderColor: propertyTheme.border, borderWidth: 1, borderRadius: 16, padding: 15, marginBottom: 12 },
  sectionTitle: { color: propertyTheme.text, fontSize: 17, fontWeight: "800", marginBottom: 10 },
  info: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  infoLabel: { flex: 1, color: propertyTheme.textMuted, fontSize: 13 },
  infoValue: { flex: 1.3, color: propertyTheme.textSecondary, fontSize: 13, textAlign: "right" },
  notes: { color: propertyTheme.textSecondary, lineHeight: 20, marginTop: 12 },
  input: { borderWidth: 1, borderColor: propertyTheme.border, borderRadius: 10, color: propertyTheme.text, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8, backgroundColor: "#fff" },
  multiline: { minHeight: 72, textAlignVertical: "top" },
  actionButton: { alignItems: "center", backgroundColor: propertyTheme.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, marginTop: 10 },
  actionButtonText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  dangerButton: { backgroundColor: propertyTheme.danger },
  disabled: { opacity: 0.65 },
  item: { padding: 12, borderRadius: 12, backgroundColor: "#f8fafc", marginTop: 8 },
  itemTitle: { color: propertyTheme.text, fontWeight: "700" },
  itemMeta: { color: propertyTheme.textMuted, fontSize: 12, marginTop: 4 },
  outlineButton: { alignSelf: "flex-start", borderWidth: 1, borderColor: propertyTheme.primary, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8, marginTop: 9 },
  outlineButtonText: { color: propertyTheme.primary, fontWeight: "800", fontSize: 12 },
  muted: { color: propertyTheme.textMuted },
  success: { color: propertyTheme.success, fontWeight: "800", marginTop: 8 },
  error: { color: propertyTheme.danger, marginBottom: 12, textAlign: "center" },
  primaryButton: { backgroundColor: propertyTheme.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  primaryButtonText: { color: "#fff", fontWeight: "800" },
});
