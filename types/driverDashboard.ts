export type DriverAccountStatus =
  | "draft"
  | "pending_verification"
  | "approved"
  | "rejected"
  | "suspended"
  | "expired_documents";

export type ActiveTripStatus = "in_progress" | "assigned" | "arrived" | "none";

export type DocumentStatus = "verified" | "pending" | "rejected" | "expired" | "missing";

export type DriverDashboardDriver = {
  id: string;
  name: string;
  avatarUrl: string | null;
  isOnline: boolean;
  accountStatus: DriverAccountStatus;
  rating: number;
  canOperate: boolean;
  enabledServiceModes: string[];
  approvedServiceUsages: string[];
};

export type DriverDashboardSummary = {
  todayEarnings: number;
  todayEarningsChangePercent: number;
  completedTripsToday: number;
  completedTripsChange: number;
  walletBalance: number;
  ordersToday: number;
  acceptanceRate: number;
  hoursOnlineMinutes: number;
  currency: string;
};

export type DriverDashboardActiveTrip = {
  id: string;
  status: ActiveTripStatus;
  pickupName: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffName: string;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  etaMinutes: number;
  distanceKm: number;
  tripType?: string;
};

export type DriverDashboardVehicle = {
  id: string;
  plateNumber: string;
  vehicleName: string;
  documentStatus: DocumentStatus;
  validUntil: string | null;
};

export type DriverDashboardResponse = {
  driver: DriverDashboardDriver;
  summary: DriverDashboardSummary;
  activeTrip: DriverDashboardActiveTrip | null;
  vehicle: DriverDashboardVehicle | null;
  notifications: {
    unreadCount: number;
  };
};

export type UpdateDriverAvailabilityPayload = {
  isOnline: boolean;
  service?: string;
};

export type UpdateDriverAvailabilityResponse = {
  isOnline: boolean;
  message: string;
};

export type DriverShellTab = "Food" | "Parcels" | "Navigate" | "Account";

export type DriverShellStackParamList = {
  DriverDashboard: undefined;
  FoodDeliveries: undefined;
  ParcelDeliveries: undefined;
  ActiveTripMap: { trip?: DriverDashboardActiveTrip };
  Account: undefined;
  DriverDocuments: undefined;
  DriverVerification: undefined;
  DriverVehicle: undefined;
  DriverTasks: undefined;
};
