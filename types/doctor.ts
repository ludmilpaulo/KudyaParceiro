export type DoctorVerificationStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended";

export type DoctorDocumentType =
  | "id_document"
  | "medical_licence"
  | "qualification_certificate"
  | "registration_certificate"
  | "background_check_consent"
  | "other";

export interface DoctorVerificationStatusResponse {
  verificationStatus: DoctorVerificationStatus;
  isActiveOnPlatform: boolean;
  profileCompletionPercentage: number;
  missingDocuments: DoctorDocumentType[];
  missingDocumentLabels: string[];
  rejectionReason: string;
  adminNotes: string;
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  canOperate: boolean;
  canSubmitForReview: boolean;
}

export interface DoctorDocument {
  id: number;
  documentType: DoctorDocumentType;
  fileUrl: string;
  originalFilename: string;
  isVerified: boolean;
  rejectionReason: string;
  uploadedAt: string;
}

export interface DoctorDashboardStats {
  clinicName: string;
  specialtyName: string;
  verificationStatus: DoctorVerificationStatus;
  isActiveOnPlatform: boolean;
  canOperate: boolean;
  profileCompletionPercent: number;
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  availableSlotsThisWeek: number;
  averageRating: number;
  reviewCount: number;
  monthlyEarnings: string;
  currency: string;
}

export interface DoctorService {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  durationMinutes: number;
  consultationType: "physical" | "online" | "both";
  isActive: boolean;
}

export interface DoctorAvailability {
  id: number;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  consultationDurationMinutes: number;
  breakDurationMinutes: number;
  consultationType: "physical" | "online" | "both";
}

export interface GeneratedSlotPreview {
  startTime: string;
  endTime: string;
}

export interface DoctorAppointment {
  id: number;
  patientName: string;
  patientEmail: string;
  serviceName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  appointmentType: string;
  consultationFee: string;
  currency: string;
  notes: string;
}

export interface DoctorProfileMe {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  professionalTitle: string;
  specialtyName: string;
  yearsExperience: number;
  languages: string;
  clinicName: string;
  biography: string;
  consultationFee: string;
  currency: string;
  onlineConsultationEnabled: boolean;
  physicalConsultationEnabled: boolean;
  licenseNumber: string;
}

export interface AppointmentSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isBlocked: boolean;
}

export const REQUIRED_DOCTOR_DOCUMENTS: { type: DoctorDocumentType; labelKey: string }[] = [
  { type: "id_document", labelKey: "docIdPassport" },
  { type: "medical_licence", labelKey: "docMedicalLicence" },
  { type: "qualification_certificate", labelKey: "docQualification" },
  { type: "registration_certificate", labelKey: "docRegistration" },
  { type: "background_check_consent", labelKey: "docBackgroundConsent" },
];
