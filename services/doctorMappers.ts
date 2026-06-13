import type {
  AppointmentSlot,
  DoctorAppointment,
  DoctorAvailability,
  DoctorDashboardStats,
  DoctorDocument,
  DoctorDocumentType,
  DoctorProfileMe,
  DoctorService,
  DoctorVerificationStatus,
  DoctorVerificationStatusResponse,
  GeneratedSlotPreview,
} from "../types/doctor";

type RawRecord = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function mapDashboardStats(raw: RawRecord): DoctorDashboardStats {
  return {
    clinicName: asString(raw.clinic_name),
    specialtyName: asString(raw.specialty_name),
    verificationStatus: asString(raw.verification_status, "draft") as DoctorVerificationStatus,
    isActiveOnPlatform: asBool(raw.is_active_on_platform),
    canOperate: asBool(raw.can_operate),
    profileCompletionPercent: asNumber(raw.profile_completion_percent),
    todayAppointments: asNumber(raw.today_appointments),
    pendingAppointments: asNumber(raw.pending_appointments),
    totalPatients: asNumber(raw.total_patients),
    availableSlotsThisWeek: asNumber(raw.available_slots_this_week),
    averageRating: asNumber(raw.average_rating),
    reviewCount: asNumber(raw.review_count),
    monthlyEarnings: asString(raw.monthly_earnings, "0"),
    currency: asString(raw.currency, "AOA"),
  };
}

export function mapVerificationStatus(raw: RawRecord): DoctorVerificationStatusResponse {
  const missing = Array.isArray(raw.missing_documents)
    ? raw.missing_documents.filter((item): item is DoctorDocumentType => typeof item === "string")
    : [];
  const missingLabels = Array.isArray(raw.missing_document_labels)
    ? raw.missing_document_labels.filter((item): item is string => typeof item === "string")
    : [];
  return {
    verificationStatus: asString(raw.verification_status, "draft") as DoctorVerificationStatus,
    isActiveOnPlatform: asBool(raw.is_active_on_platform),
    profileCompletionPercentage: asNumber(raw.profile_completion_percentage),
    missingDocuments: missing,
    missingDocumentLabels: missingLabels,
    rejectionReason: asString(raw.rejection_reason),
    adminNotes: asString(raw.admin_notes),
    submittedForReviewAt: raw.submitted_for_review_at ? asString(raw.submitted_for_review_at) : null,
    reviewedAt: raw.reviewed_at ? asString(raw.reviewed_at) : null,
    canOperate: asBool(raw.can_operate),
    canSubmitForReview: asBool(raw.can_submit_for_review),
  };
}

export function mapDoctorDocument(raw: RawRecord): DoctorDocument {
  return {
    id: asNumber(raw.id),
    documentType: asString(raw.document_type, "other") as DoctorDocumentType,
    fileUrl: asString(raw.file_url),
    originalFilename: asString(raw.original_filename),
    isVerified: asBool(raw.is_verified),
    rejectionReason: asString(raw.rejection_reason),
    uploadedAt: asString(raw.uploaded_at),
  };
}

export function mapService(raw: RawRecord): DoctorService {
  return {
    id: asNumber(raw.id),
    name: asString(raw.name),
    description: asString(raw.description),
    price: asString(raw.price),
    currency: asString(raw.currency),
    durationMinutes: asNumber(raw.duration_minutes, 60),
    consultationType: (raw.consultation_type as DoctorService["consultationType"]) || "both",
    isActive: asBool(raw.is_active, true),
  };
}

export function mapAvailability(raw: RawRecord): DoctorAvailability {
  return {
    id: asNumber(raw.id),
    dayOfWeek: asNumber(raw.day_of_week),
    dayName: asString(raw.day_name),
    startTime: asString(raw.start_time).slice(0, 5),
    endTime: asString(raw.end_time).slice(0, 5),
    consultationDurationMinutes: asNumber(raw.consultation_duration_minutes, 60),
    breakDurationMinutes: asNumber(raw.break_duration_minutes, 10),
    consultationType: (raw.consultation_type as DoctorAvailability["consultationType"]) || "both",
  };
}

export function mapAppointment(raw: RawRecord): DoctorAppointment {
  return {
    id: asNumber(raw.id),
    patientName: asString(raw.patient_name),
    patientEmail: asString(raw.patient_email),
    serviceName: raw.service_name === null ? null : asString(raw.service_name),
    date: asString(raw.date),
    startTime: asString(raw.start_time).slice(0, 5),
    endTime: asString(raw.end_time).slice(0, 5),
    status: asString(raw.status),
    appointmentType: asString(raw.appointment_type),
    consultationFee: asString(raw.consultation_fee),
    currency: asString(raw.currency),
    notes: asString(raw.notes),
  };
}

export function mapGeneratedSlots(raw: RawRecord): GeneratedSlotPreview[] {
  const rows = (raw.generated_slots as RawRecord[] | undefined) ?? [];
  return rows.map((row) => ({
    startTime: asString(row.start_time).slice(0, 5),
    endTime: asString(row.end_time).slice(0, 5),
  }));
}

export function mapProfile(raw: RawRecord): DoctorProfileMe {
  return {
    id: asNumber(raw.id),
    email: asString(raw.email),
    firstName: asString(raw.first_name),
    lastName: asString(raw.last_name),
    professionalTitle: asString(raw.professional_title),
    specialtyName: asString(raw.specialty_name),
    yearsExperience: asNumber(raw.years_experience),
    languages: asString(raw.languages),
    clinicName: asString(raw.clinic_name),
    biography: asString(raw.biography),
    consultationFee: asString(raw.consultation_fee),
    currency: asString(raw.currency),
    onlineConsultationEnabled: asBool(raw.online_consultation_enabled),
    physicalConsultationEnabled: asBool(raw.physical_consultation_enabled),
    licenseNumber: asString(raw.license_number),
  };
}

export function mapSlot(raw: RawRecord): AppointmentSlot {
  return {
    id: asNumber(raw.id),
    date: asString(raw.date),
    startTime: asString(raw.start_time).slice(0, 5),
    endTime: asString(raw.end_time).slice(0, 5),
    isBooked: asBool(raw.is_booked),
    isBlocked: asBool(raw.is_blocked),
  };
}
