import type {
  PropertyDashboardStats,
  PropertyEnquiry,
  PropertyListing,
} from "../types/property";
import { mapMetricComparison } from "../utils/analyticsExport";
import { getBaseApiUrl } from "../utils/apiClient";

type RawRecord = Record<string, unknown>;

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function mediaUrl(value: unknown): string {
  const path = str(value);
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getBaseApiUrl().replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export function mapPropertyEnquiry(row: RawRecord): PropertyEnquiry {
  return {
    id: num(row.id),
    propertyListingId: num(row.property_listing),
    propertyTitle: str(row.property_title),
    enquiryType: str(row.enquiry_type, "general"),
    message: str(row.message),
    status: str(row.status, "pending") as PropertyEnquiry["status"],
    createdAt: str(row.created_at),
  };
}

function mapPurpose(value: unknown): PropertyListing["purpose"] | undefined {
  const purpose = str(value);
  if (purpose === "rent" || purpose === "stay" || purpose === "sale") return purpose;
  return undefined;
}

function mapOptionalString(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  return String(value);
}

function mapOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function mapLeaseMonths(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const months = value
    .map((item) => mapOptionalNumber(item))
    .filter((item): item is number => item != null);
  return months.length > 0 ? months : undefined;
}

export function mapPropertyListing(row: RawRecord): PropertyListing {
  const imagesRaw = Array.isArray(row.images) ? row.images : [];
  const images = imagesRaw.map((item, index) => {
    const image = (item ?? {}) as RawRecord;
    return {
      id: num(image.id, index),
      url: mediaUrl(image.image),
      order: num(image.order, index),
    };
  });
  const video = row.video;
  const staySummary =
    row.stay_settings_summary && typeof row.stay_settings_summary === "object"
      ? (row.stay_settings_summary as RawRecord)
      : null;
  return {
    id: num(row.id),
    title: str(row.title),
    description: str(row.description),
    address: str(row.address),
    city: str(row.city),
    suburb: str(row.suburb),
    listingType: str(row.listing_type, "rent_monthly") as PropertyListing["listingType"],
    propertyType: str(row.property_type, "apartment"),
    price: str(row.price, "0"),
    currency: str(row.currency, "AOA"),
    bedrooms: num(row.bedrooms),
    bathrooms: num(row.bathrooms),
    isAvailable: bool(row.is_available, true),
    isApproved: bool(row.is_approved),
    approvalStatus: str(row.approval_status, "pending") as PropertyListing["approvalStatus"],
    enquiryCount: num(row.enquiry_count),
    createdAt: str(row.created_at),
    images,
    videoUrl: mediaUrl(video) || null,
    deposit: mapOptionalString(row.deposit),
    monthlyRent: mapOptionalString(row.monthly_rent),
    purpose: mapPurpose(row.purpose),
    allowedLeaseMonths: mapLeaseMonths(row.allowed_lease_months),
    pricePerNight:
      mapOptionalString(row.price_per_night) ??
      mapOptionalString(staySummary?.price_per_night),
    weekendPrice:
      mapOptionalString(row.weekend_price) ??
      mapOptionalString(staySummary?.weekend_price),
    cleaningFee:
      mapOptionalString(row.cleaning_fee) ??
      mapOptionalString(staySummary?.cleaning_fee),
    minNights:
      mapOptionalNumber(row.min_nights) ?? mapOptionalNumber(staySummary?.min_nights),
    maxGuests:
      mapOptionalNumber(row.max_guests) ?? mapOptionalNumber(staySummary?.max_guests),
  };
}

function mapChartSeries(raw: unknown): PropertyDashboardStats["analytics"]["enquiriesByDay"] {
  const row = (raw ?? {}) as RawRecord;
  const labels = Array.isArray(row.labels) ? row.labels.map((label) => str(label)) : [];
  const data = Array.isArray(row.data) ? row.data.map((value) => num(value)) : [];
  return { labels, data };
}

function mapPropertyAnalytics(raw: unknown): PropertyDashboardStats["analytics"] {
  const row = (raw ?? {}) as RawRecord;
  const topRaw = (row.top_listings_by_enquiries ?? {}) as RawRecord;
  const topLabels = Array.isArray(topRaw.labels) ? topRaw.labels.map((label) => str(label)) : [];
  const topData = Array.isArray(topRaw.data) ? topRaw.data.map((value) => num(value)) : [];
  const topIds = Array.isArray(topRaw.ids) ? topRaw.ids.map((value) => num(value)) : [];
  const comparisonRaw = (row.comparison ?? {}) as RawRecord;
  return {
    days: num(row.days, 7),
    periodStart: str(row.period_start) || undefined,
    periodEnd: str(row.period_end) || undefined,
    previousPeriodStart: str(row.previous_period_start) || undefined,
    previousPeriodEnd: str(row.previous_period_end) || undefined,
    enquiriesByDay: mapChartSeries(row.enquiries_by_day),
    listingsByType: mapChartSeries(row.listings_by_type),
    enquiriesByStatus: mapChartSeries(row.enquiries_by_status),
    listingsByApproval: mapChartSeries(row.listings_by_approval),
    topListingsByEnquiries: { labels: topLabels, data: topData, ids: topIds },
    comparison: {
      enquiries: mapMetricComparison(comparisonRaw.enquiries),
      listingsCreated: mapMetricComparison(comparisonRaw.listings_created),
    },
  };
}

export function mapPropertyDashboardStats(row: RawRecord): PropertyDashboardStats {
  const recent = Array.isArray(row.recent_enquiries) ? row.recent_enquiries : [];
  return {
    businessName: str(row.business_name),
    totalListings: num(row.total_listings),
    activeListings: num(row.active_listings),
    approvedListings: num(row.approved_listings),
    pendingListings: num(row.pending_listings),
    pendingEnquiries: num(row.pending_enquiries),
    totalEnquiries: num(row.total_enquiries),
    stayBookings: num(row.stay_bookings),
    leaseCount: num(row.lease_count),
    applicationCount: num(row.application_count),
    recentEnquiries: recent.map((item) => mapPropertyEnquiry(item as RawRecord)),
    analytics: mapPropertyAnalytics(row.analytics),
  };
}

export function toSnakeListingInput(input: {
  title: string;
  description?: string;
  address: string;
  city: string;
  suburb?: string;
  street?: string;
  formattedAddress?: string;
  country: number;
  province: number;
  cityRef: number;
  district?: number | null;
  latitude: number;
  longitude: number;
  showExactAddress?: boolean;
  locationSource?: string;
  listingType: string;
  propertyType?: string;
  price: string;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  furnished?: boolean;
  parking?: boolean;
  amenities?: string[];
  isAvailable?: boolean;
  images?: Array<{ uri: string; name: string; type: string }>;
  video?: { uri: string; name: string; type: string } | null;
  deposit?: string;
  monthlyRent?: string;
  purpose?: string;
  allowedLeaseMonths?: number[];
  pricePerNight?: string;
  weekendPrice?: string;
  cleaningFee?: string;
  minNights?: number;
  maxGuests?: number;
}): FormData {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description ?? "");
  formData.append("address", input.address);
  formData.append("city", input.city);
  formData.append("suburb", input.suburb ?? "");
  formData.append("street", input.street ?? "");
  formData.append("formatted_address", input.formattedAddress ?? "");
  formData.append("country", String(input.country));
  formData.append("province", String(input.province));
  formData.append("city_ref", String(input.cityRef));
  if (input.district != null) {
    formData.append("district", String(input.district));
  }
  formData.append("latitude", String(input.latitude));
  formData.append("longitude", String(input.longitude));
  formData.append("show_exact_address", String(input.showExactAddress ?? false));
  formData.append("location_source", input.locationSource || "map_pin");
  formData.append("listing_type", input.listingType);
  formData.append("property_type", input.propertyType ?? "apartment");
  formData.append("price", input.price);
  formData.append("currency", input.currency ?? "AOA");
  formData.append("bedrooms", String(input.bedrooms ?? 0));
  formData.append("bathrooms", String(input.bathrooms ?? 0));
  formData.append("parking_spaces", String(input.parkingSpaces ?? 0));
  formData.append("furnished", String(input.furnished ?? false));
  formData.append("parking", String(input.parking ?? (input.parkingSpaces ?? 0) > 0));
  formData.append("is_available", String(input.isAvailable ?? true));
  if (input.deposit != null && input.deposit !== "") {
    formData.append("deposit", input.deposit);
  }
  if (input.monthlyRent != null && input.monthlyRent !== "") {
    formData.append("monthly_rent", input.monthlyRent);
  }
  if (input.purpose) {
    formData.append("purpose", input.purpose);
  }
  for (const month of input.allowedLeaseMonths ?? []) {
    formData.append("allowed_lease_months", String(month));
  }
  if (input.pricePerNight != null && input.pricePerNight !== "") {
    formData.append("price_per_night", input.pricePerNight);
  }
  if (input.weekendPrice != null && input.weekendPrice !== "") {
    formData.append("weekend_price", input.weekendPrice);
  }
  if (input.cleaningFee != null && input.cleaningFee !== "") {
    formData.append("cleaning_fee", input.cleaningFee);
  }
  if (input.minNights != null) {
    formData.append("min_nights", String(input.minNights));
  }
  if (input.maxGuests != null) {
    formData.append("max_guests", String(input.maxGuests));
  }
  for (const key of input.amenities ?? []) {
    formData.append("amenities", key);
  }

  for (const image of input.images ?? []) {
    formData.append("images", image as unknown as Blob);
  }
  if (input.video) {
    formData.append("video", input.video as unknown as Blob);
  }
  return formData;
}
