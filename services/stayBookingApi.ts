import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  PartnerStayBooking,
  PartnerStayBookingsResponse,
  PropertyAvailabilityDay,
  PropertyBlockedDate,
} from "../types/property";
import { apiFetch, parseApiResponse } from "../utils/apiClient";

type RawRecord = Record<string, unknown>;

async function readAuthToken(): Promise<string | undefined> {
  try {
    // Prefer live Redux store (same path as property API create).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { store } = require("../redux/store") as {
      store: { getState: () => { auth?: { user?: Record<string, string> } } };
    };
    const live = store.getState().auth?.user;
    const liveToken = live?.token || live?.access || live?.access_token;
    if (liveToken) return liveToken;
  } catch {
    // ignore circular/store load issues
  }
  try {
    const raw = await AsyncStorage.getItem("persist:root");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { auth?: string };
    const auth = parsed.auth
      ? (JSON.parse(parsed.auth) as { user?: Record<string, string> })
      : undefined;
    const user = auth?.user;
    return user?.token || user?.access || user?.access_token;
  } catch {
    return undefined;
  }
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await readAuthToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function mapBooking(row: RawRecord): PartnerStayBooking {
  return {
    id: num(row.id),
    propertyId: num(row.property_id),
    propertyTitle: str(row.property_title),
    propertyCity: str(row.property_city),
    bookingCode: str(row.booking_code),
    checkIn: str(row.check_in),
    checkOut: str(row.check_out),
    nights: num(row.nights),
    adults: num(row.adults),
    children: num(row.children),
    infants: num(row.infants),
    status: str(row.status),
    currency: str(row.currency, "AOA"),
    totalAmount: String(row.total_amount ?? "0"),
    guestName: str(row.guest_name),
    guestNotes: str(row.guest_notes),
    createdAt: str(row.created_at),
  };
}

function mapBlockedDate(row: RawRecord): PropertyBlockedDate {
  return {
    id: num(row.id),
    startDate: str(row.start_date),
    endDate: str(row.end_date),
    reason: str(row.reason),
    notes: str(row.notes),
    createdAt: str(row.created_at),
  };
}

function mapAvailabilityDay(row: RawRecord): PropertyAvailabilityDay {
  return {
    date: str(row.date),
    status: str(row.status, "available"),
    price: row.price == null || row.price === "" ? null : String(row.price),
    currency: str(row.currency, "AOA"),
  };
}

export async function fetchPartnerStayBookings(): Promise<PartnerStayBookingsResponse> {
  const response = await apiFetch("/api/properties/me/stay-bookings/", {
    headers: await authHeaders(),
  });
  const data = await parseApiResponse<RawRecord>(response);
  const statsRaw = (data.stats ?? {}) as RawRecord;
  const resultsRaw = Array.isArray(data.results) ? data.results : [];
  return {
    stats: {
      today: num(statsRaw.today),
      upcoming: num(statsRaw.upcoming),
      thisMonth: num(statsRaw.this_month),
    },
    results: resultsRaw.map((item) => mapBooking((item ?? {}) as RawRecord)),
  };
}

export async function fetchListingAvailability(
  listingId: number,
  from?: string,
  to?: string,
): Promise<PropertyAvailabilityDay[]> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  const response = await apiFetch(
    `/api/properties/${listingId}/availability/${query ? `?${query}` : ""}`,
    { headers: await authHeaders() },
  );
  const data = await parseApiResponse<RawRecord>(response);
  const days = Array.isArray(data.days) ? data.days : [];
  return days.map((item) => mapAvailabilityDay((item ?? {}) as RawRecord));
}

export async function fetchBlockedDates(listingId: number): Promise<PropertyBlockedDate[]> {
  const response = await apiFetch(`/api/properties/me/listings/${listingId}/blocked-dates/`, {
    headers: await authHeaders(),
  });
  const data = await parseApiResponse<unknown>(response);
  if (!Array.isArray(data)) return [];
  return data.map((item) => mapBlockedDate((item ?? {}) as RawRecord));
}

export async function createBlockedDates(
  listingId: number,
  payload: { startDate: string; endDate: string; reason?: string; notes?: string },
): Promise<PropertyBlockedDate> {
  const response = await apiFetch(`/api/properties/me/listings/${listingId}/blocked-dates/`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      start_date: payload.startDate,
      end_date: payload.endDate,
      reason: payload.reason ?? "",
      notes: payload.notes ?? "",
    }),
  });
  const data = await parseApiResponse<RawRecord>(response);
  return mapBlockedDate(data);
}

export async function deleteBlockedDate(listingId: number, blockId: number): Promise<void> {
  const response = await apiFetch(
    `/api/properties/me/listings/${listingId}/blocked-dates/${blockId}/`,
    {
      method: "DELETE",
      headers: await authHeaders(),
    },
  );
  if (!response.ok && response.status !== 204) {
    await parseApiResponse(response);
  }
}
