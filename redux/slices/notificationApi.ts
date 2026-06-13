import { createApi } from "@reduxjs/toolkit/query/react";
import type { AppNotification, UnreadNotificationCountResponse } from "../../types/notification";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

type RawRecord = Record<string, unknown>;

function mapNotification(raw: RawRecord): AppNotification {
  return {
    id: typeof raw.id === "number" ? raw.id : Number(raw.id),
    notificationType: (typeof raw.notification_type === "string" ? raw.notification_type : "new_booking") as AppNotification["notificationType"],
    title: typeof raw.title === "string" ? raw.title : "",
    message: typeof raw.message === "string" ? raw.message : "",
    actionUrl: typeof raw.action_url === "string" ? raw.action_url : "",
    isRead: Boolean(raw.is_read),
    createdAt: typeof raw.created_at === "string" ? raw.created_at : "",
  };
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: createApiBaseQuery("/api/notifications"),
  tagTypes: ["Notifications", "UnreadCount"],
  endpoints: (builder) => ({
    getNotifications: builder.query<AppNotification[], void>({
      query: () => "/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapNotification(row)),
      providesTags: ["Notifications"],
    }),
    getUnreadNotificationCount: builder.query<UnreadNotificationCountResponse, void>({
      query: () => "/unread-count/",
      transformResponse: (response: RawRecord) => ({
        unreadCount: typeof response.unread_count === "number" ? response.unread_count : 0,
      }),
      providesTags: ["UnreadCount"],
    }),
    markNotificationRead: builder.mutation<AppNotification, number>({
      query: (id) => ({ url: `/${id}/read/`, method: "PATCH" }),
      transformResponse: (response: RawRecord) => mapNotification(response),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
    markAllNotificationsRead: builder.mutation<{ updated: number }, void>({
      query: () => ({ url: "/mark-all-read/", method: "PATCH" }),
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
