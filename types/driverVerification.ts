export type DriverVerificationStatus =
  | "draft"
  | "pending_verification"
  | "approved"
  | "rejected"
  | "suspended"
  | "expired_documents";

export type DriverChecklistItem = {
  key: string;
  labelKey: string;
  done: boolean;
};

export type DriverVerificationStatusResponse = {
  verificationStatus: DriverVerificationStatus;
  vehicleVerificationStatus: string;
  isVerified: boolean;
  canOperate: boolean;
  profileCompletionPercentage: number;
  missingPersonalDocuments: string[];
  missingVehicleDocuments: string[];
  rejectionReason: string;
  suspensionReason: string;
  adminNotes: string;
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  checklist: DriverChecklistItem[];
  canSubmitForReview: boolean;
};

export type DriverDocumentRecord = {
  id: number;
  documentType: string;
  documentTypeLabel: string;
  fileUrl: string | null;
  originalFilename: string;
  expiryDate: string | null;
  verificationStatus: string;
  rejectionReason: string;
  uploadedAt: string;
};

export type DriverVehicleRecord = {
  id: number;
  vehicleType: string;
  plateNumber: string;
  make: string;
  model: string;
  color: string;
  year: number | null;
  verificationStatus: string;
};

export const REQUIRED_PERSONAL_DOCUMENTS = [
  { type: "profile_photo", labelKey: "uploadProfilePhoto" },
  { type: "id_document", labelKey: "uploadIdPassport" },
  { type: "drivers_licence", labelKey: "uploadDriversLicence" },
  { type: "police_clearance", labelKey: "uploadPoliceClearance" },
] as const;

export const REQUIRED_VEHICLE_DOCUMENTS = [
  { type: "vehicle_registration", labelKey: "vehicleRegistration" },
  { type: "licence_disc", labelKey: "licenceDisc" },
  { type: "vehicle_insurance", labelKey: "vehicleInsurance" },
  { type: "photo_front", labelKey: "photoFront" },
  { type: "photo_back", labelKey: "photoBack" },
  { type: "photo_left", labelKey: "photoLeft" },
  { type: "photo_right", labelKey: "photoRight" },
  { type: "photo_interior", labelKey: "photoInterior" },
  { type: "photo_number_plate", labelKey: "photoNumberPlate" },
] as const;
