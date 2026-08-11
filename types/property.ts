export type PropertyListingType = "rent_daily" | "rent_monthly" | "buy";

export type PropertyPurpose = "rent" | "stay" | "sale";

export type PropertyApprovalStatus =
  | "draft"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended";

export type PropertyEnquiryStatus =
  | "pending"
  | "responded"
  | "scheduled"
  | "approved"
  | "rejected"
  | "closed";

export type PropertyListingImage = {
  id: number;
  url: string;
  order: number;
};

export type PropertyListing = {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  suburb: string;
  listingType: PropertyListingType;
  propertyType: string;
  price: string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  isAvailable: boolean;
  isApproved: boolean;
  approvalStatus: PropertyApprovalStatus;
  enquiryCount: number;
  createdAt: string;
  images: PropertyListingImage[];
  videoUrl: string | null;
  deposit?: string;
  monthlyRent?: string;
  purpose?: PropertyPurpose;
  allowedLeaseMonths?: number[];
  pricePerNight?: string;
  weekendPrice?: string;
  cleaningFee?: string;
  minNights?: number;
  maxGuests?: number;
};

export type PartnerStayBooking = {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyCity: string;
  bookingCode: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  status: string;
  currency: string;
  totalAmount: string;
  guestName: string;
  guestNotes: string;
  createdAt: string;
};

export type PartnerStayBookingsResponse = {
  stats: { today: number; upcoming: number; thisMonth: number };
  results: PartnerStayBooking[];
};

export type PropertyAvailabilityDay = {
  date: string;
  status: string;
  price: string | null;
  currency: string;
};

export type PropertyBlockedDate = {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  notes: string;
  createdAt: string;
};

export type PropertyMediaAsset = {
  uri: string;
  name: string;
  type: string;
};

export type PropertyEnquiry = {
  id: number;
  propertyListingId: number;
  propertyTitle: string;
  enquiryType: string;
  message: string;
  status: PropertyEnquiryStatus;
  createdAt: string;
};

export type PropertyApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "viewing_required"
  | "viewing_completed"
  | "conditionally_approved"
  | "documents_required"
  | "documents_verified"
  | "lease_generated"
  | "tenant_signature_required"
  | "owner_signature_required"
  | "lease_executed"
  | "active"
  | "rejected";

export type PropertyApplication = {
  id: number;
  propertyListingId: number;
  propertyTitle: string;
  propertyCity: string;
  status: PropertyApplicationStatus;
  proposedRent: string | null;
  currency: string;
  moveInDate: string | null;
  submittedAt: string | null;
  createdAt: string;
};

export type PropertyApplicationDocument = {
  id: number;
  documentType: string;
  status: "required" | "uploaded" | "under_review" | "verified" | "rejected" | "expired";
  originalFilename: string;
  rejectionReason: string;
  reviewedAt: string | null;
  uploadedAt: string;
  updatedAt: string;
  downloadPath: string;
};

export type PropertyViewing = {
  id: number;
  scheduledAt: string;
  location: string;
  notes: string;
  status: "proposed" | "confirmed" | "completed" | "cancelled" | "reschedule_requested";
  customerNote: string;
  createdAt: string;
  updatedAt: string;
};

export type PropertyLeaseSignature = {
  id: number;
  role: string;
  signerName: string;
  signedAt: string | null;
  signatureName: string;
  isSigned: boolean;
};

export type PropertyLease = {
  id: number;
  applicationId: number;
  propertyListingId: number;
  propertyTitle: string;
  version: number;
  language: string;
  status: string;
  signingOrder: string;
  startDate: string | null;
  endDate: string | null;
  monthlyRent: string;
  deposit: string;
  currency: string;
  specialConditions: string;
  renderedBody: string;
  documentId: string;
  executedAt: string | null;
  createdAt: string;
  signatures: PropertyLeaseSignature[];
};

export type PropertyApplicationDetail = Omit<PropertyApplication, "propertyCity"> & {
  propertyOwnerName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  nationality: string;
  currentAddress: string;
  employmentStatus: string;
  occupation: string;
  rentalPeriodMonths: number | null;
  occupants: number | null;
  adults: number | null;
  children: number | null;
  hasPets: boolean;
  petDetails: string;
  additionalNotes: string;
  proposedDeposit: string | null;
  specialConditions: string;
  rejectionReason: string;
  preferredLeaseLanguage: string;
  updatedAt: string;
  documents: PropertyApplicationDocument[];
  viewings: PropertyViewing[];
  leases: PropertyLease[];
};

export type PropertyApplicationApprovalInput = {
  specialConditions?: string;
  proposedRent?: string;
  proposedDeposit?: string;
};

export type PropertyViewingInput = {
  scheduledAt: string;
  location: string;
  notes?: string;
};

export type PropertyChartSeries = {
  labels: string[];
  data: number[];
};

export type PropertyRankedSeries = PropertyChartSeries & {
  ids?: number[];
};

export type PropertyMetricComparison = {
  current: number;
  previous: number;
  delta: number;
  percentChange: number | null;
};

export type PropertyDashboardAnalytics = {
  days: number;
  periodStart?: string;
  periodEnd?: string;
  previousPeriodStart?: string;
  previousPeriodEnd?: string;
  enquiriesByDay: PropertyChartSeries;
  listingsByType: PropertyChartSeries;
  enquiriesByStatus: PropertyChartSeries;
  listingsByApproval: PropertyChartSeries;
  topListingsByEnquiries: PropertyRankedSeries;
  comparison: {
    enquiries: PropertyMetricComparison;
    listingsCreated: PropertyMetricComparison;
  };
};

export type PropertyDashboardStats = {
  businessName: string;
  totalListings: number;
  activeListings: number;
  approvedListings: number;
  pendingListings: number;
  pendingEnquiries: number;
  totalEnquiries: number;
  recentEnquiries: PropertyEnquiry[];
  analytics: PropertyDashboardAnalytics;
};

export type PropertyLocationSource = "gps" | "address_search" | "map_pin" | "manual" | "";

export type PropertyListingInput = {
  title: string;
  description?: string;
  address: string;
  city: string;
  suburb?: string;
  street?: string;
  formattedAddress?: string;
  country: number;
  province: number;
  cityRef: number;
  district?: number | null;
  latitude: number;
  longitude: number;
  showExactAddress?: boolean;
  locationSource?: PropertyLocationSource;
  listingType: PropertyListingType;
  propertyType?: string;
  price: string;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  furnished?: boolean;
  parking?: boolean;
  amenities?: string[];
  isAvailable?: boolean;
  images?: PropertyMediaAsset[];
  video?: PropertyMediaAsset | null;
  deposit?: string;
  monthlyRent?: string;
  purpose?: PropertyPurpose;
  allowedLeaseMonths?: number[];
  pricePerNight?: string;
  weekendPrice?: string;
  cleaningFee?: string;
  minNights?: number;
  maxGuests?: number;
};
