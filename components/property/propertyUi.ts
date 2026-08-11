import type { PropertyListing } from "../../types/property";

/** Property vertical brand (teal) — distinct from food primary blue. */
export const propertyTheme = {
  primary: "#0f766e",
  primaryDark: "#0d9488",
  primarySoft: "#ccfbf1",
  accent: "#f59e0b",
  background: "#f4f6f8",
  surface: "#ffffff",
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#64748b",
  border: "#e2e8f0",
  danger: "#e11d48",
  success: "#059669",
  warning: "#d97706",
} as const;

export type PropertyUiStatus =
  | "active"
  | "pending"
  | "draft"
  | "inactive"
  | "rejected"
  | "suspended";

export function getListingUiStatus(listing: PropertyListing): PropertyUiStatus {
  if (listing.approvalStatus === "draft") return "draft";
  if (listing.approvalStatus === "rejected") return "rejected";
  if (listing.approvalStatus === "suspended") return "suspended";
  if (
    listing.approvalStatus === "pending" ||
    listing.approvalStatus === "under_review"
  ) {
    return "pending";
  }
  if (listing.isApproved && listing.isAvailable) return "active";
  if (listing.isApproved && !listing.isAvailable) return "inactive";
  if (!listing.isApproved) return "pending";
  return "inactive";
}

export function purposeFromListingType(listingType: string): "rent" | "stay" | "sale" {
  if (listingType === "buy") return "sale";
  if (listingType === "rent_daily") return "stay";
  return "rent";
}

export function listingPurpose(listing: PropertyListing): "rent" | "stay" | "sale" {
  if (listing.purpose === "rent" || listing.purpose === "stay" || listing.purpose === "sale") {
    return listing.purpose;
  }
  return purposeFromListingType(listing.listingType);
}

export function listingTypeFromPurpose(purpose: "rent" | "stay" | "sale"): string {
  if (purpose === "sale") return "buy";
  if (purpose === "stay") return "rent_daily";
  return "rent_monthly";
}

export const STATUS_BADGE_COLORS: Record<
  PropertyUiStatus,
  { bg: string; text: string; dot: string }
> = {
  active: { bg: "#d1fae5", text: "#065f46", dot: "#059669" },
  pending: { bg: "#fef3c7", text: "#92400e", dot: "#d97706" },
  draft: { bg: "#e2e8f0", text: "#334155", dot: "#64748b" },
  inactive: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  rejected: { bg: "#ffe4e6", text: "#9f1239", dot: "#e11d48" },
  suspended: { bg: "#ffedd5", text: "#9a3412", dot: "#ea580c" },
};
