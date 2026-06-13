import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  AppointmentSlot,
  DoctorAppointment,
  DoctorAvailability,
  DoctorDashboardStats,
  DoctorDocument,
  DoctorDocumentType,
  DoctorProfileMe,
  DoctorService,
  DoctorVerificationStatusResponse,
  GeneratedSlotPreview,
} from "../../types/doctor";
import {
  mapAppointment,
  mapAvailability,
  mapDashboardStats,
  mapDoctorDocument,
  mapGeneratedSlots,
  mapProfile,
  mapService,
  mapSlot,
  mapVerificationStatus,
} from "../../services/doctorMappers";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

type RawRecord = Record<string, unknown>;

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: createApiBaseQuery("/api/doctors"),
  tagTypes: ["DoctorDashboard", "DoctorVerification", "DoctorDocuments", "DoctorServices", "DoctorAvailability", "DoctorAppointments", "DoctorProfile", "DoctorSlots"],
  endpoints: (builder) => ({
    getPartnerDoctorDashboard: builder.query<DoctorDashboardStats, void>({
      query: () => "/me/dashboard/",
      transformResponse: (response: RawRecord) => mapDashboardStats(response),
      providesTags: ["DoctorDashboard"],
    }),
    getDoctorVerificationStatus: builder.query<DoctorVerificationStatusResponse, void>({
      query: () => "/me/verification-status/",
      transformResponse: (response: RawRecord) => mapVerificationStatus(response),
      providesTags: ["DoctorVerification"],
    }),
    getDoctorDocuments: builder.query<DoctorDocument[], void>({
      query: () => "/me/documents/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapDoctorDocument(row)),
      providesTags: ["DoctorDocuments"],
    }),
    uploadDoctorDocument: builder.mutation<DoctorDocument, { documentType: DoctorDocumentType; file: { uri: string; name: string; type: string } }>({
      query: ({ documentType, file }) => {
        const formData = new FormData();
        formData.append("document_type", documentType);
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as unknown as Blob);
        return { url: "/me/documents/", method: "POST", body: formData };
      },
      transformResponse: (response: RawRecord) => mapDoctorDocument(response),
      invalidatesTags: ["DoctorDocuments", "DoctorVerification", "DoctorDashboard"],
    }),
    deleteDoctorDocument: builder.mutation<void, number>({
      query: (id) => ({ url: `/me/documents/${id}/`, method: "DELETE" }),
      invalidatesTags: ["DoctorDocuments", "DoctorVerification"],
    }),
    submitDoctorForReview: builder.mutation<DoctorVerificationStatusResponse, void>({
      query: () => ({ url: "/me/submit-for-review/", method: "POST", body: {} }),
      transformResponse: (response: RawRecord) => mapVerificationStatus(response),
      invalidatesTags: ["DoctorVerification", "DoctorDashboard"],
    }),
    getDoctorProfile: builder.query<DoctorProfileMe, void>({
      query: () => "/me/profile/",
      transformResponse: (response: RawRecord) => mapProfile(response),
      providesTags: ["DoctorProfile"],
    }),
    updateDoctorProfile: builder.mutation<DoctorProfileMe, Partial<DoctorProfileMe>>({
      query: (body) => ({
        url: "/me/profile/",
        method: "PATCH",
        body: {
          clinic_name: body.clinicName,
          biography: body.biography,
          professional_title: body.professionalTitle,
          years_experience: body.yearsExperience,
          languages: body.languages,
          consultation_fee: body.consultationFee,
          online_consultation_enabled: body.onlineConsultationEnabled,
          physical_consultation_enabled: body.physicalConsultationEnabled,
          license_number: body.licenseNumber,
        },
      }),
      transformResponse: (response: RawRecord) => mapProfile(response),
      invalidatesTags: ["DoctorProfile", "DoctorDashboard", "DoctorVerification"],
    }),
    getDoctorServices: builder.query<DoctorService[], void>({
      query: () => "/me/services/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapService(row)),
      providesTags: ["DoctorServices"],
    }),
    createDoctorService: builder.mutation<
      DoctorService,
      { name: string; price: string; description?: string; durationMinutes?: number }
    >({
      query: (body) => ({
        url: "/me/services/",
        method: "POST",
        body: {
          name: body.name,
          price: body.price,
          description: body.description ?? "",
          duration_minutes: body.durationMinutes ?? 60,
          consultation_type: "both",
          is_active: true,
        },
      }),
      transformResponse: (response: RawRecord) => mapService(response),
      invalidatesTags: ["DoctorServices", "DoctorDashboard"],
    }),
    deleteDoctorService: builder.mutation<void, number>({
      query: (id) => ({ url: `/me/services/${id}/`, method: "DELETE" }),
      invalidatesTags: ["DoctorServices"],
    }),
    getDoctorAvailability: builder.query<DoctorAvailability[], void>({
      query: () => "/me/availability/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapAvailability(row)),
      providesTags: ["DoctorAvailability"],
    }),
    createDoctorAvailability: builder.mutation<DoctorAvailability, Record<string, unknown>>({
      query: (body) => ({ url: "/me/availability/", method: "POST", body }),
      transformResponse: (response: RawRecord) => mapAvailability(response),
      invalidatesTags: ["DoctorAvailability", "DoctorDashboard"],
    }),
    deleteDoctorAvailability: builder.mutation<void, number>({
      query: (id) => ({ url: `/me/availability/${id}/`, method: "DELETE" }),
      invalidatesTags: ["DoctorAvailability"],
    }),
    previewDoctorAvailability: builder.mutation<GeneratedSlotPreview[], Record<string, unknown>>({
      query: (body) => ({ url: "/me/availability/preview/", method: "POST", body }),
      transformResponse: (response: RawRecord) => mapGeneratedSlots(response),
    }),
    getDoctorSlots: builder.query<AppointmentSlot[], string | undefined>({
      query: (date) => (date ? `/me/slots/?date=${date}` : "/me/slots/"),
      transformResponse: (response: RawRecord[]) => response.map((row) => mapSlot(row)),
      providesTags: ["DoctorSlots"],
    }),
    blockDoctorSlot: builder.mutation<AppointmentSlot, { id: number; isBlocked: boolean }>({
      query: ({ id, isBlocked }) => ({
        url: `/me/slots/${id}/block/`,
        method: "PATCH",
        body: { is_blocked: isBlocked },
      }),
      transformResponse: (response: RawRecord) => mapSlot(response),
      invalidatesTags: ["DoctorSlots", "DoctorDashboard"],
    }),
    getDoctorAppointments: builder.query<DoctorAppointment[], { filter?: string; search?: string }>({
      query: ({ filter = "all", search = "" }) => {
        const params = new URLSearchParams({ filter });
        if (search) params.set("search", search);
        return `/me/appointments/?${params.toString()}`;
      },
      transformResponse: (response: RawRecord[]) => response.map((row) => mapAppointment(row)),
      providesTags: ["DoctorAppointments"],
    }),
    updateDoctorAppointmentStatus: builder.mutation<DoctorAppointment, { id: number; status: string; cancellationReason?: string }>({
      query: ({ id, status, cancellationReason }) => ({
        url: `/me/appointments/${id}/status/`,
        method: "PATCH",
        body: {
          status,
          cancellation_reason: cancellationReason ?? "",
        },
      }),
      transformResponse: (response: RawRecord) => mapAppointment(response),
      invalidatesTags: ["DoctorAppointments", "DoctorDashboard"],
    }),
  }),
});

export const {
  useGetPartnerDoctorDashboardQuery,
  useGetDoctorProfileQuery,
  useUpdateDoctorProfileMutation,
  useGetDoctorSlotsQuery,
  useBlockDoctorSlotMutation,
  useGetDoctorVerificationStatusQuery,
  useGetDoctorDocumentsQuery,
  useUploadDoctorDocumentMutation,
  useDeleteDoctorDocumentMutation,
  useSubmitDoctorForReviewMutation,
  useGetDoctorServicesQuery,
  useCreateDoctorServiceMutation,
  useDeleteDoctorServiceMutation,
  useGetDoctorAvailabilityQuery,
  useCreateDoctorAvailabilityMutation,
  useDeleteDoctorAvailabilityMutation,
  usePreviewDoctorAvailabilityMutation,
  useGetDoctorAppointmentsQuery,
  useUpdateDoctorAppointmentStatusMutation,
} = doctorApi;
