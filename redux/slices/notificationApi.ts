import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  AppNotification,
  NotificationListParams,
  UnreadNotificationCountResponse,
} from "../../types/notification";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

type RawRecord = Record<string, unknown>;

function mapNotification(raw: RawRecord): AppNotification {
  const id = typeof raw.id === "string" ? raw.id : String(raw.id ?? "");
  return {
    id,
    source: (typeof raw.source === "string" ? raw.source : "unified") as AppNotification["source"],
    module: typeof raw.module === "string" ? raw.module : "",
    notificationType:
      typeof raw.notification_type === "string" ? raw.notification_type : "new_booking",
    title: typeof raw.title === "string" ? raw.title : "",
    message: typeof raw.message === "string" ? raw.message : "",
    actionUrl: typeof raw.action_url === "string" ? raw.action_url : "",
    isRead: Boolean(raw.is_read),
    createdAt: typeof raw.created_at === "string" ? raw.created_at : "",
  };
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: createApiBaseQuery("/api/v1/notifications"),
  tagTypes: ["Notifications", "UnreadCount"],
  endpoints: (builder) => ({
    getNotifications: builder.query<AppNotification[], NotificationListParams | void>({
      query: (params) => ({
        url: "/",
        params: params ?? undefined,
      }),
      transformResponse: (response: RawRecord[]) => response.map((row) => mapNotification(row)),
      providesTags: ["Notifications"],
    }),
    getUnreadNotificationCount: builder.query<UnreadNotificationCountResponse, NotificationListParams | void>({
      query: (params) => ({
        url: "/unread-count/",
        params: params ?? undefined,
      }),
      transformResponse: (response: RawRecord) => ({
        unreadCount: typeof response.unread_count === "number" ? response.unread_count : 0,
      }),
      providesTags: ["UnreadCount"],
    }),
    markNotificationRead: builder.mutation<{ ok: boolean }, string>({
      query: (compositeId) => ({
        url: `/${encodeURIComponent(compositeId)}/read/`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
    markAllNotificationsRead: builder.mutation<{ updated: number }, NotificationListParams | void>({
      query: (params) => ({
        url: "/mark-all-read/",
        method: "PATCH",
        body: params?.module ? { module: params.module } : {},
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
