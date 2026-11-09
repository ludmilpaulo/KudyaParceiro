import { createApi } from "@reduxjs/toolkit/query/react";
import type { LanguagePreference, SupportedLanguage } from "../../types/language";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

type RawRecord = Record<string, unknown>;

function asLanguage(value: unknown): SupportedLanguage | null {
  if (typeof value !== "string" || !value) return null;
  const code = value.slice(0, 2).toLowerCase();
  if (code === "en" || code === "pt" || code === "fr" || code === "es") return code;
  return null;
}

function mapLanguagePreference(raw: RawRecord): LanguagePreference {
  const hasFlag = "preferenceSet" in raw || "preference_set" in raw;
  const preferenceSet = raw.preferenceSet === true || raw.preference_set === true;
  const preferred =
    hasFlag && !preferenceSet ? null : asLanguage(raw.preferredLanguage ?? raw.preferred_language);
  const system = asLanguage(raw.systemLanguage ?? raw.system_language);
  return {
    preferredLanguage: preferred,
    systemLanguage: system,
    activeLanguage: asLanguage(raw.activeLanguage ?? raw.active_language) ?? preferred ?? system,
    preferenceSet: hasFlag ? preferenceSet : preferred != null,
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
      { preferredLanguage?: SupportedLanguage; systemLanguage?: SupportedLanguage | null }
    >({
      query: (body) => ({
        url: "/language/",
        method: "PATCH",
        body: {
          ...(body.preferredLanguage ? { preferredLanguage: body.preferredLanguage } : {}),
          ...(body.systemLanguage ? { systemLanguage: body.systemLanguage } : {}),
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
