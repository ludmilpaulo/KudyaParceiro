import type { DoctorAppointment, GeneratedSlotPreview } from "../types/doctor";

export type DoctorStackParamList = {
  DoctorDrawerRoot: undefined;
  DoctorAppointmentDetails: { appointment: DoctorAppointment };
  DoctorSlotPreview: { dayLabel: string; slots: GeneratedSlotPreview[] };
};
