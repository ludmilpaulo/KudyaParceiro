import { createApi } from "@reduxjs/toolkit/query/react";
import type { DriverDocumentRecord, DriverVerificationStatusResponse, DriverVehicleRecord } from "../../types/driverVerification";
import { mapDriverDocument, mapDriverVehicle, mapVerificationStatus } from "../../services/driverVerificationMappers";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

type RawRecord = Record<string, unknown>;

export const driverApi = createApi({
  reducerPath: "driverApi",
  baseQuery: createApiBaseQuery("/api/drivers"),
  tagTypes: ["DriverVerification", "DriverDocuments", "DriverVehicle"],
  endpoints: (builder) => ({
    getDriverVerificationStatus: builder.query<DriverVerificationStatusResponse, void>({
      query: () => "/me/verification-status/",
      transformResponse: (response: RawRecord) => mapVerificationStatus(response),
      providesTags: ["DriverVerification"],
    }),
    getDriverPersonalDocuments: builder.query<DriverDocumentRecord[], void>({
      query: () => "/me/personal-documents/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapDriverDocument(row)),
      providesTags: ["DriverDocuments"],
    }),
    getDriverVehicleDocuments: builder.query<DriverDocumentRecord[], void>({
      query: () => "/me/vehicle-documents/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapDriverDocument(row)),
      providesTags: ["DriverDocuments"],
    }),
    getDriverVehicle: builder.query<DriverVehicleRecord, void>({
      query: () => "/me/vehicle/",
      transformResponse: (response: RawRecord) => mapDriverVehicle(response),
      providesTags: ["DriverVehicle"],
    }),
    updateDriverVehicle: builder.mutation<DriverVehicleRecord, Partial<DriverVehicleRecord>>({
      query: (body) => ({
        url: "/me/vehicle/",
        method: "PATCH",
        body: {
          vehicle_type: body.vehicleType,
          plate_number: body.plateNumber,
          make: body.make,
          model: body.model,
          color: body.color,
          year: body.year,
        },
      }),
      transformResponse: (response: RawRecord) => mapDriverVehicle(response),
      invalidatesTags: ["DriverVehicle", "DriverVerification"],
    }),
    uploadDriverPersonalDocument: builder.mutation<
      DriverDocumentRecord,
      { documentType: string; file: { uri: string; name: string; type: string }; expiryDate?: string }
    >({
      query: ({ documentType, file, expiryDate }) => {
        const formData = new FormData();
        formData.append("document_type", documentType);
        formData.append("file", { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
        if (expiryDate) formData.append("expiry_date", expiryDate);
        return { url: "/me/personal-documents/", method: "POST", body: formData };
      },
      transformResponse: (response: RawRecord) => mapDriverDocument(response),
      invalidatesTags: ["DriverDocuments", "DriverVerification"],
    }),
    uploadDriverVehicleDocument: builder.mutation<
      DriverDocumentRecord,
      { documentType: string; file: { uri: string; name: string; type: string }; expiryDate?: string }
    >({
      query: ({ documentType, file, expiryDate }) => {
        const formData = new FormData();
        formData.append("document_type", documentType);
        formData.append("file", { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
        if (expiryDate) formData.append("expiry_date", expiryDate);
        return { url: "/me/vehicle-documents/", method: "POST", body: formData };
      },
      transformResponse: (response: RawRecord) => mapDriverDocument(response),
      invalidatesTags: ["DriverDocuments", "DriverVerification"],
    }),
    submitDriverForReview: builder.mutation<DriverVerificationStatusResponse, void>({
      query: () => ({ url: "/me/submit-for-review/", method: "POST", body: {} }),
      transformResponse: (response: RawRecord) => mapVerificationStatus(response),
      invalidatesTags: ["DriverVerification"],
    }),
  }),
});

export const {
  useGetDriverVerificationStatusQuery,
  useGetDriverPersonalDocumentsQuery,
  useGetDriverVehicleDocumentsQuery,
  useGetDriverVehicleQuery,
  useUpdateDriverVehicleMutation,
  useUploadDriverPersonalDocumentMutation,
  useUploadDriverVehicleDocumentMutation,
  useSubmitDriverForReviewMutation,
} = driverApi;
