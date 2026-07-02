import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  DriverDashboardResponse,
  UpdateDriverAvailabilityPayload,
  UpdateDriverAvailabilityResponse,
} from "../../types/driverDashboard";
import { mapAvailabilityResponse, mapDriverDashboard } from "../../services/driverDashboardMappers";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

type RawRecord = Record<string, unknown>;

export const driverDashboardApi = createApi({
  reducerPath: "driverDashboardApi",
  baseQuery: createApiBaseQuery("/api/partner/driver"),
  tagTypes: ["DriverDashboard"],
  endpoints: (builder) => ({
    getDriverDashboard: builder.query<DriverDashboardResponse, void>({
      query: () => "/dashboard/",
      transformResponse: (response: RawRecord) => mapDriverDashboard(response),
      providesTags: ["DriverDashboard"],
    }),
    updateDriverAvailability: builder.mutation<
      UpdateDriverAvailabilityResponse,
      UpdateDriverAvailabilityPayload
    >({
      query: (body) => ({
        url: "/availability/",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: RawRecord) => mapAvailabilityResponse(response),
      invalidatesTags: ["DriverDashboard"],
    }),
  }),
});

export const { useGetDriverDashboardQuery, useUpdateDriverAvailabilityMutation } = driverDashboardApi;
