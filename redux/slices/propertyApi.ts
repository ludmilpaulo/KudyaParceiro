import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  PropertyDashboardStats,
  PropertyEnquiry,
  PropertyEnquiryStatus,
  PropertyApplication,
  PropertyApplicationApprovalInput,
  PropertyApplicationDetail,
  PropertyApplicationDocument,
  PropertyListing,
  PropertyListingInput,
  PropertyLease,
  PropertyViewing,
  PropertyViewingInput,
} from "../../types/property";
import {
  mapPropertyDashboardStats,
  mapPropertyEnquiry,
  mapPropertyListing,
  toSnakeListingInput,
} from "../../services/propertyMappers";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

type RawRecord = Record<string, unknown>;

const asString = (value: unknown): string => (typeof value === "string" ? value : "");
const asNullableString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;
const asNumber = (value: unknown): number => (typeof value === "number" ? value : 0);
const asBoolean = (value: unknown): boolean => value === true;
const asRecords = (value: unknown): RawRecord[] =>
  Array.isArray(value) ? value.filter((item): item is RawRecord => typeof item === "object" && item !== null) : [];

const mapDocument = (row: RawRecord): PropertyApplicationDocument => ({
  id: asNumber(row.id),
  documentType: asString(row.document_type),
  status: asString(row.status) as PropertyApplicationDocument["status"],
  originalFilename: asString(row.original_filename),
  rejectionReason: asString(row.rejection_reason),
  reviewedAt: asNullableString(row.reviewed_at),
  uploadedAt: asString(row.uploaded_at),
  updatedAt: asString(row.updated_at),
  downloadPath: asString(row.download_path),
});

const mapViewing = (row: RawRecord): PropertyViewing => ({
  id: asNumber(row.id),
  scheduledAt: asString(row.scheduled_at),
  location: asString(row.location),
  notes: asString(row.notes),
  status: asString(row.status) as PropertyViewing["status"],
  customerNote: asString(row.customer_note),
  createdAt: asString(row.created_at),
  updatedAt: asString(row.updated_at),
});

const mapLease = (row: RawRecord): PropertyLease => ({
  id: asNumber(row.id),
  applicationId: asNumber(row.application),
  propertyListingId: asNumber(row.property_listing),
  propertyTitle: asString(row.property_title),
  version: asNumber(row.version),
  language: asString(row.language),
  status: asString(row.status),
  signingOrder: asString(row.signing_order),
  startDate: asNullableString(row.start_date),
  endDate: asNullableString(row.end_date),
  monthlyRent: asString(row.monthly_rent),
  deposit: asString(row.deposit),
  currency: asString(row.currency),
  specialConditions: asString(row.special_conditions),
  renderedBody: asString(row.rendered_body),
  documentId: asString(row.document_id),
  executedAt: asNullableString(row.executed_at),
  createdAt: asString(row.created_at),
  signatures: asRecords(row.signatures).map((signature) => ({
    id: asNumber(signature.id),
    role: asString(signature.role),
    signerName: asString(signature.signer_name),
    signedAt: asNullableString(signature.signed_at),
    signatureName: asString(signature.signature_name),
    isSigned: asBoolean(signature.is_signed),
  })),
});

const mapApplication = (row: RawRecord): PropertyApplication => ({
  id: asNumber(row.id),
  propertyListingId: asNumber(row.property_listing),
  propertyTitle: asString(row.property_title),
  propertyCity: asString(row.property_city),
  status: asString(row.status) as PropertyApplication["status"],
  proposedRent: asNullableString(row.proposed_rent),
  currency: asString(row.currency),
  moveInDate: asNullableString(row.move_in_date),
  submittedAt: asNullableString(row.submitted_at),
  createdAt: asString(row.created_at),
});

const mapApplicationDetail = (row: RawRecord): PropertyApplicationDetail => ({
  ...mapApplication(row),
  propertyOwnerName: asString(row.property_owner_name),
  fullName: asString(row.full_name),
  email: asString(row.email),
  phone: asString(row.phone),
  dateOfBirth: asNullableString(row.date_of_birth),
  nationality: asString(row.nationality),
  currentAddress: asString(row.current_address),
  employmentStatus: asString(row.employment_status),
  occupation: asString(row.occupation),
  rentalPeriodMonths: typeof row.rental_period_months === "number" ? row.rental_period_months : null,
  occupants: typeof row.occupants === "number" ? row.occupants : null,
  adults: typeof row.adults === "number" ? row.adults : null,
  children: typeof row.children === "number" ? row.children : null,
  hasPets: asBoolean(row.has_pets),
  petDetails: asString(row.pet_details),
  additionalNotes: asString(row.additional_notes),
  proposedDeposit: asNullableString(row.proposed_deposit),
  specialConditions: asString(row.special_conditions),
  rejectionReason: asString(row.rejection_reason),
  preferredLeaseLanguage: asString(row.preferred_lease_language),
  updatedAt: asString(row.updated_at),
  documents: asRecords(row.documents).map(mapDocument),
  viewings: asRecords(row.viewings).map(mapViewing),
  leases: asRecords(row.leases).map(mapLease),
});

export const propertyApi = createApi({
  reducerPath: "propertyApi",
  baseQuery: createApiBaseQuery("/api/properties"),
  tagTypes: ["PropertyDashboard", "PropertyListings", "PropertyEnquiries", "PropertyApplications"],
  endpoints: (builder) => ({
    getPropertyDashboard: builder.query<PropertyDashboardStats, { days?: number } | void>({
      query: (params) => {
        const days = params && "days" in params ? params.days : undefined;
        return days ? `/me/dashboard/?days=${days}` : "/me/dashboard/";
      },
      transformResponse: (response: RawRecord) => mapPropertyDashboardStats(response),
      providesTags: ["PropertyDashboard"],
    }),
    getPropertyListings: builder.query<PropertyListing[], void>({
      query: () => "/me/listings/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapPropertyListing(row)),
      providesTags: ["PropertyListings"],
    }),
    createPropertyListing: builder.mutation<PropertyListing, PropertyListingInput>({
      query: (body) => ({
        url: "/me/listings/",
        method: "POST",
        body: toSnakeListingInput(body),
      }),
      transformResponse: (response: RawRecord) => mapPropertyListing(response),
      invalidatesTags: ["PropertyListings", "PropertyDashboard"],
    }),
    updatePropertyListing: builder.mutation<
      PropertyListing,
      { id: number; patch: Partial<PropertyListingInput> & { isAvailable?: boolean } }
    >({
      query: ({ id, patch }) => {
        const formData = new FormData();
        if (patch.title !== undefined) formData.append("title", patch.title);
        if (patch.description !== undefined) formData.append("description", patch.description);
        if (patch.address !== undefined) formData.append("address", patch.address);
        if (patch.city !== undefined) formData.append("city", patch.city);
        if (patch.listingType !== undefined) formData.append("listing_type", patch.listingType);
        if (patch.propertyType !== undefined) formData.append("property_type", patch.propertyType);
        if (patch.price !== undefined) formData.append("price", patch.price);
        if (patch.currency !== undefined) formData.append("currency", patch.currency);
        if (patch.bedrooms !== undefined) formData.append("bedrooms", String(patch.bedrooms));
        if (patch.bathrooms !== undefined) formData.append("bathrooms", String(patch.bathrooms));
        if (patch.isAvailable !== undefined) formData.append("is_available", String(patch.isAvailable));
        for (const image of patch.images ?? []) {
          formData.append("images", image as unknown as Blob);
        }
        if (patch.video) {
          formData.append("video", patch.video as unknown as Blob);
        }
        return {
          url: `/me/listings/${id}/`,
          method: "PATCH",
          body: formData,
        };
      },
      transformResponse: (response: RawRecord) => mapPropertyListing(response),
      invalidatesTags: ["PropertyListings", "PropertyDashboard"],
    }),
    getPropertyEnquiries: builder.query<PropertyEnquiry[], { status?: string } | void>({
      query: (params) => {
        const status = params && "status" in params ? params.status : undefined;
        return status ? `/me/enquiries/?status=${encodeURIComponent(status)}` : "/me/enquiries/";
      },
      transformResponse: (response: RawRecord[]) => response.map((row) => mapPropertyEnquiry(row)),
      providesTags: ["PropertyEnquiries"],
    }),
    updatePropertyEnquiryStatus: builder.mutation<
      PropertyEnquiry,
      { id: number; status: PropertyEnquiryStatus }
    >({
      query: ({ id, status }) => ({
        url: `/me/enquiries/${id}/status/`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: RawRecord) => mapPropertyEnquiry(response),
      invalidatesTags: ["PropertyEnquiries", "PropertyDashboard"],
    }),
    getPropertyApplications: builder.query<PropertyApplication[], void>({
      query: () => "/me/applications/",
      transformResponse: (response: RawRecord[]) => response.map(mapApplication),
      providesTags: ["PropertyApplications"],
    }),
    getPropertyApplication: builder.query<PropertyApplicationDetail, number>({
      query: (id) => `/me/applications/${id}/`,
      transformResponse: (response: RawRecord) => mapApplicationDetail(response),
      providesTags: (_result, _error, id) => [{ type: "PropertyApplications", id }],
    }),
    reviewPropertyApplication: builder.mutation<PropertyApplicationDetail, number>({
      query: (id) => ({ url: `/me/applications/${id}/review/`, method: "POST" }),
      transformResponse: (response: RawRecord) => mapApplicationDetail(response),
      invalidatesTags: (_result, _error, id) => ["PropertyApplications", { type: "PropertyApplications", id }],
    }),
    approvePropertyApplication: builder.mutation<
      PropertyApplicationDetail,
      { id: number; body: PropertyApplicationApprovalInput }
    >({
      query: ({ id, body }) => ({ url: `/me/applications/${id}/approve/`, method: "POST", body }),
      transformResponse: (response: RawRecord) => mapApplicationDetail(response),
      invalidatesTags: (_result, _error, { id }) => ["PropertyApplications", { type: "PropertyApplications", id }],
    }),
    rejectPropertyApplication: builder.mutation<PropertyApplicationDetail, { id: number; reason: string }>({
      query: ({ id, reason }) => ({ url: `/me/applications/${id}/reject/`, method: "POST", body: { reason } }),
      transformResponse: (response: RawRecord) => mapApplicationDetail(response),
      invalidatesTags: (_result, _error, { id }) => ["PropertyApplications", { type: "PropertyApplications", id }],
    }),
    proposePropertyViewing: builder.mutation<PropertyViewing, { id: number; body: PropertyViewingInput }>({
      query: ({ id, body }) => ({
        url: `/me/applications/${id}/viewing/`,
        method: "POST",
        body: { scheduled_at: body.scheduledAt, location: body.location, notes: body.notes ?? "" },
      }),
      transformResponse: (response: RawRecord) => mapViewing(response),
      invalidatesTags: (_result, _error, { id }) => ["PropertyApplications", { type: "PropertyApplications", id }],
    }),
    completePropertyViewing: builder.mutation<PropertyViewing, { applicationId: number; viewingId: number }>({
      query: ({ applicationId, viewingId }) => ({
        url: `/me/applications/${applicationId}/viewings/${viewingId}/complete/`,
        method: "POST",
      }),
      transformResponse: (response: RawRecord) => mapViewing(response),
      invalidatesTags: (_result, _error, { applicationId }) => [
        "PropertyApplications",
        { type: "PropertyApplications", id: applicationId },
      ],
    }),
    verifyApplicationDocument: builder.mutation<
      PropertyApplicationDocument,
      { applicationId: number; documentId: number }
    >({
      query: ({ applicationId, documentId }) => ({
        url: `/me/applications/${applicationId}/documents/${documentId}/verify/`,
        method: "POST",
      }),
      transformResponse: (response: RawRecord) => mapDocument(response),
      invalidatesTags: (_result, _error, { applicationId }) => [
        "PropertyApplications",
        { type: "PropertyApplications", id: applicationId },
      ],
    }),
    rejectApplicationDocument: builder.mutation<
      PropertyApplicationDocument,
      { applicationId: number; documentId: number; reason: string }
    >({
      query: ({ applicationId, documentId, reason }) => ({
        url: `/me/applications/${applicationId}/documents/${documentId}/reject/`,
        method: "POST",
        body: { reason },
      }),
      transformResponse: (response: RawRecord) => mapDocument(response),
      invalidatesTags: (_result, _error, { applicationId }) => [
        "PropertyApplications",
        { type: "PropertyApplications", id: applicationId },
      ],
    }),
    generatePropertyLease: builder.mutation<PropertyLease, { applicationId: number; language: string }>({
      query: ({ applicationId, language }) => ({
        url: `/me/applications/${applicationId}/generate-lease/`,
        method: "POST",
        body: { language },
      }),
      transformResponse: (response: RawRecord) => mapLease(response),
      invalidatesTags: (_result, _error, { applicationId }) => [
        "PropertyApplications",
        { type: "PropertyApplications", id: applicationId },
      ],
    }),
    signPropertyLease: builder.mutation<PropertyLease, { id: number; signatureName: string }>({
      query: ({ id, signatureName }) => ({
        url: `/me/leases/${id}/sign/`,
        method: "POST",
        body: { signature_name: signatureName },
      }),
      transformResponse: (response: RawRecord) => mapLease(response),
      invalidatesTags: ["PropertyApplications"],
    }),
  }),
});

export const {
  useGetPropertyDashboardQuery,
  useGetPropertyListingsQuery,
  useCreatePropertyListingMutation,
  useUpdatePropertyListingMutation,
  useGetPropertyEnquiriesQuery,
  useUpdatePropertyEnquiryStatusMutation,
  useGetPropertyApplicationsQuery,
  useGetPropertyApplicationQuery,
  useReviewPropertyApplicationMutation,
  useApprovePropertyApplicationMutation,
  useRejectPropertyApplicationMutation,
  useProposePropertyViewingMutation,
  useCompletePropertyViewingMutation,
  useVerifyApplicationDocumentMutation,
  useRejectApplicationDocumentMutation,
  useGeneratePropertyLeaseMutation,
  useSignPropertyLeaseMutation,
} = propertyApi;
