export type NotificationType =
  | "doctor_approved"
  | "doctor_rejected"
  | "new_booking"
  | "booking_cancelled"
  | "appointment_confirmed"
  | "appointment_completed"
  | "appointment_updated"
  | "verification_request";

export interface AppNotification {
  id: number;
  notificationType: NotificationType;
  title: string;
  message: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}
