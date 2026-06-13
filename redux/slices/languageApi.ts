import { createApi } from "@reduxjs/toolkit/query/react";
import type { LanguagePreference, SupportedLanguage } from "../../types/language";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

type RawRecord = Record<string, unknown>;

function mapLanguagePreference(raw: RawRecord): LanguagePreference {
  return {
    preferredLanguage: String(raw.preferredLanguage ?? raw.preferred_language ?? "en") as SupportedLanguage,
    systemLanguage: raw.systemLanguage
      ? (String(raw.systemLanguage) as SupportedLanguage)
      : raw.system_language
        ? (String(raw.system_language) as SupportedLanguage)
        : null,
    activeLanguage: String(raw.activeLanguage ?? raw.active_language ?? "en") as SupportedLanguage,
  };
}

export const languageApi = createApi({
  reducerPath: "languageApi",
  baseQuery: createApiBaseQuery("/api/me"),
  endpoints: (builder) => ({
    getLanguagePreference: builder.query<LanguagePreference, void>({
      query: () => "/language/",
      transformResponse: (response: RawRecord) => mapLanguagePreference(response),
    }),
    updateLanguagePreference: builder.mutation<
      LanguagePreference,
      { preferredLanguage: SupportedLanguage; systemLanguage?: SupportedLanguage | null }
    >({
      query: (body) => ({
        url: "/language/",
        method: "PATCH",
        body: {
          preferredLanguage: body.preferredLanguage,
          systemLanguage: body.systemLanguage,
        },
      }),
      transformResponse: (response: RawRecord) => mapLanguagePreference(response),
    }),
  }),
});

export const pushTokenApi = createApi({
  reducerPath: "pushTokenApi",
  baseQuery: createApiBaseQuery("/api/push-tokens"),
  endpoints: (builder) => ({
    registerPushToken: builder.mutation<
      { id: number; token: string },
      { token: string; platform: string; deviceId?: string; language?: string }
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body: {
          token: body.token,
          platform: body.platform,
          deviceId: body.deviceId,
          language: body.language,
        },
      }),
    }),
  }),
});

export const {
  useGetLanguagePreferenceQuery,
  useUpdateLanguagePreferenceMutation,
} = languageApi;

export const { useRegisterPushTokenMutation } = pushTokenApi;
