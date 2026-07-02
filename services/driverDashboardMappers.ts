import type {
  DriverDashboardActiveTrip,
  DriverDashboardResponse,
  DriverDashboardVehicle,
  UpdateDriverAvailabilityResponse,
} from "../types/driverDashboard";

type RawRecord = Record<string, unknown>;

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function mapActiveTrip(raw: RawRecord | null | undefined): DriverDashboardActiveTrip | null {
  if (!raw) return null;
  return {
    id: asString(raw.id),
    status: asString(raw.status, "none") as DriverDashboardActiveTrip["status"],
    pickupName: asString(raw.pickupName),
    pickupAddress: asString(raw.pickupAddress),
    pickupLatitude: asNumber(raw.pickupLatitude),
    pickupLongitude: asNumber(raw.pickupLongitude),
    dropoffName: asString(raw.dropoffName),
    dropoffAddress: asString(raw.dropoffAddress),
    dropoffLatitude: asNumber(raw.dropoffLatitude),
    dropoffLongitude: asNumber(raw.dropoffLongitude),
    etaMinutes: asNumber(raw.etaMinutes),
    distanceKm: asNumber(raw.distanceKm),
    tripType: asString(raw.tripType) || undefined,
  };
}

function mapVehicle(raw: RawRecord | null | undefined): DriverDashboardVehicle | null {
  if (!raw) return null;
  return {
    id: asString(raw.id),
    plateNumber: asString(raw.plateNumber),
    vehicleName: asString(raw.vehicleName),
    documentStatus: asString(raw.documentStatus, "pending") as DriverDashboardVehicle["documentStatus"],
    validUntil: typeof raw.validUntil === "string" ? raw.validUntil : null,
  };
}

export function mapDriverDashboard(raw: RawRecord): DriverDashboardResponse {
  const driver = (raw.driver ?? {}) as RawRecord;
  const summary = (raw.summary ?? {}) as RawRecord;
  const notifications = (raw.notifications ?? {}) as RawRecord;

  return {
    driver: {
      id: asString(driver.id),
      name: asString(driver.name),
      avatarUrl: typeof driver.avatarUrl === "string" ? driver.avatarUrl : null,
      isOnline: Boolean(driver.isOnline),
      accountStatus: asString(driver.accountStatus, "draft") as DriverDashboardResponse["driver"]["accountStatus"],
      rating: asNumber(driver.rating),
      canOperate: Boolean(driver.canOperate),
      enabledServiceModes: Array.isArray(driver.enabledServiceModes)
        ? driver.enabledServiceModes.map(String)
        : [],
      approvedServiceUsages: Array.isArray(driver.approvedServiceUsages)
        ? driver.approvedServiceUsages.map(String)
        : [],
    },
    summary: {
      todayEarnings: asNumber(summary.todayEarnings),
      todayEarningsChangePercent: asNumber(summary.todayEarningsChangePercent),
      completedTripsToday: asNumber(summary.completedTripsToday),
      completedTripsChange: asNumber(summary.completedTripsChange),
      walletBalance: asNumber(summary.walletBalance),
      ordersToday: asNumber(summary.ordersToday),
      acceptanceRate: asNumber(summary.acceptanceRate),
      hoursOnlineMinutes: asNumber(summary.hoursOnlineMinutes),
      currency: asString(summary.currency, "ZAR"),
    },
    activeTrip: mapActiveTrip(raw.activeTrip as RawRecord | null),
    vehicle: mapVehicle(raw.vehicle as RawRecord | null),
    notifications: {
      unreadCount: asNumber(notifications.unreadCount),
    },
  };
}

export function mapAvailabilityResponse(raw: RawRecord): UpdateDriverAvailabilityResponse {
  return {
    isOnline: Boolean(raw.isOnline),
    message: asString(raw.message),
  };
}
