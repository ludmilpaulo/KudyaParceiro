import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PropertyListingType, PropertyLocationSource, PropertyMediaAsset } from "../types/property";

const DRAFT_KEY = "kudya.property.listingDraft.v1";

export type PropertyListingDraft = {
  step: number;
  purpose: "rent" | "stay" | "sale" | "";
  listingType: PropertyListingType | "";
  propertyType: string;
  title: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  areaSqm: string;
  furnished: boolean;
  city: string;
  suburb: string;
  address: string;
  countryId: number | null;
  provinceId: number | null;
  cityRefId: number | null;
  districtId: number | null;
  latitude: number | null;
  longitude: number | null;
  street: string;
  formattedAddress: string;
  showExactAddress: boolean;
  locationSource: PropertyLocationSource;
  locationConfirmed: boolean;
  price: string;
  currency: string;
  deposit: string;
  weekendPrice: string;
  cleaningFee: string;
  minNights: string;
  maxGuests: string;
  leaseMonths: number[];
  amenities: string[];
  photos: PropertyMediaAsset[];
  updatedAt: string;
};

export const emptyPropertyDraft = (): PropertyListingDraft => ({
  step: 0,
  purpose: "",
  listingType: "",
  propertyType: "",
  title: "",
  description: "",
  bedrooms: "0",
  bathrooms: "0",
  parkingSpaces: "0",
  areaSqm: "",
  furnished: false,
  city: "",
  suburb: "",
  address: "",
  countryId: null,
  provinceId: null,
  cityRefId: null,
  districtId: null,
  latitude: null,
  longitude: null,
  street: "",
  formattedAddress: "",
  showExactAddress: false,
  locationSource: "",
  locationConfirmed: false,
  price: "",
  currency: "AOA",
  deposit: "",
  weekendPrice: "",
  cleaningFee: "",
  minNights: "2",
  maxGuests: "4",
  leaseMonths: [6, 12],
  amenities: [],
  photos: [],
  updatedAt: new Date().toISOString(),
});

export async function loadPropertyDraft(): Promise<PropertyListingDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PropertyListingDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...emptyPropertyDraft(), ...parsed };
  } catch {
    return null;
  }
}

export async function savePropertyDraft(draft: PropertyListingDraft): Promise<void> {
  try {
    await AsyncStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // Ignore storage failures — wizard still works in-session.
  }
}

export async function clearPropertyDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch {
    // no-op
  }
}

export async function hasPropertyDraft(): Promise<boolean> {
  const draft = await loadPropertyDraft();
  if (!draft) return false;
  return Boolean(
    draft.purpose ||
      draft.title ||
      draft.city ||
      draft.cityRefId ||
      draft.latitude != null ||
      draft.photos.length,
  );
}
