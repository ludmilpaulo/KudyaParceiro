import { createApi } from "@reduxjs/toolkit/query/react";
import type { PartnerMeResponse, PartnerType } from "../../types/partner";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

type RawRecord = Record<string, unknown>;

function mapPartnerMe(raw: RawRecord): PartnerMeResponse {
  return {
    id: String(raw.id ?? ""),
    partnerType: (typeof raw.partnerType === "string" ? raw.partnerType : raw.partner_type) as PartnerType,
    verificationStatus: String(raw.verificationStatus ?? raw.verification_status ?? "draft"),
    isActiveOnPlatform: Boolean(raw.isActiveOnPlatform ?? raw.is_active_on_platform),
    displayName: String(raw.displayName ?? raw.display_name ?? ""),
    categorySlug: raw.categorySlug ? String(raw.categorySlug) : raw.category_slug ? String(raw.category_slug) : null,
  };
}

export const partnerApi = createApi({
  reducerPath: "partnerApi",
  baseQuery: createApiBaseQuery("/api/v1/partner"),
  tagTypes: ["PartnerMe"],
  endpoints: (builder) => ({
    getPartnerMe: builder.query<PartnerMeResponse, void>({
      query: () => "/me/",
      transformResponse: (response: RawRecord) => mapPartnerMe(response),
      providesTags: ["PartnerMe"],
    }),
  }),
});

export const { useGetPartnerMeQuery } = partnerApi;
