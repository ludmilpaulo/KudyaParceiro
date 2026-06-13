export type PartnerType =
  | "restaurant"
  | "shop"
  | "doctor"
  | "driver"
  | "property"
  | "service_provider";

export interface PartnerMeResponse {
  id: string;
  partnerType: PartnerType;
  verificationStatus: string;
  isActiveOnPlatform: boolean;
  displayName: string;
  categorySlug: string | null;
}
