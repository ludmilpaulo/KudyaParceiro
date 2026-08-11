import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getBaseApiUrl } from "../../utils/apiClient";
import { useCreatePropertyListingMutation } from "../../redux/slices/propertyApi";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import type { PropertyListingType, PropertyMediaAsset } from "../../types/property";
import {
  clearPropertyDraft,
  emptyPropertyDraft,
  loadPropertyDraft,
  savePropertyDraft,
  type PropertyListingDraft,
} from "../../utils/propertyDraftStorage";
import { listingTypeFromPurpose, propertyTheme } from "../../components/property/propertyUi";
import PropertyLocationPicker from "../../components/property/PropertyLocationPicker";

type DrawerNav = DrawerNavigationProp<Record<string, undefined>>;

type AmenityOption = { key: string; name: string };

const STEPS = [
  "purpose",
  "type",
  "details",
  "location",
  "pricing",
  "photos",
  "review",
] as const;

const FALLBACK_TYPES = [
  "apartment",
  "house",
  "villa",
  "townhouse",
  "room",
  "studio",
  "office",
  "commercial",
  "land",
  "hotel",
  "guest_house",
  "lodge",
  "other",
];

const FALLBACK_AMENITIES: AmenityOption[] = [
  { key: "wifi", name: "Wi‑Fi" },
  { key: "parking", name: "Parking" },
  { key: "pool", name: "Swimming Pool" },
  { key: "security", name: "24/7 Security" },
  { key: "generator", name: "Generator" },
  { key: "air_conditioning", name: "Air Conditioning" },
  { key: "furnished", name: "Furnished" },
  { key: "balcony", name: "Balcony" },
  { key: "elevator", name: "Elevator" },
  { key: "gym", name: "Gym" },
  { key: "garden", name: "Garden" },
  { key: "water_tank", name: "Water Tank" },
];

function assetFromPicker(asset: ImagePicker.ImagePickerAsset, fallbackName: string): PropertyMediaAsset {
  const uri = asset.uri;
  const mime = asset.mimeType || "image/jpeg";
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  return { uri, name: asset.fileName || `${fallbackName}.${ext}`, type: mime };
}

export default function PropertyAddWizardScreen() {
  const { pt, propertyTypeLabel, amenityLabel, purposeLabel } = usePropertyTranslation();
  const navigation = useNavigation<DrawerNav>();
  const [createListing, { isLoading: creating }] = useCreatePropertyListingMutation();

  const [draft, setDraft] = useState<PropertyListingDraft>(emptyPropertyDraft());
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(FALLBACK_TYPES);
  const [amenities, setAmenities] = useState<AmenityOption[]>(FALLBACK_AMENITIES);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void (async () => {
      const existing = await loadPropertyDraft();
      if (existing) setDraft(existing);
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    void fetch(`${getBaseApiUrl()}/api/properties/property-types/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => {
        if (!Array.isArray(data)) return;
        const values = data
          .map((row) =>
            row && typeof row === "object" && "value" in row
              ? String((row as { value: unknown }).value)
              : "",
          )
          .filter(Boolean);
        if (values.length) setPropertyTypes(values);
      })
      .catch(() => undefined);

    void fetch(`${getBaseApiUrl()}/api/properties/amenities/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const next = data
          .map((row) => {
            if (!row || typeof row !== "object") return null;
            const item = row as { key?: unknown; name?: unknown };
            if (typeof item.key !== "string") return null;
            return {
              key: item.key,
              name: typeof item.name === "string" ? item.name : item.key,
            };
          })
          .filter((row): row is AmenityOption => Boolean(row));
        if (next.length) setAmenities(next);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void savePropertyDraft(draft).then(() => {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1200);
      });
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [draft, hydrated]);

  const step = Math.min(Math.max(draft.step, 0), STEPS.length - 1);
  const stepKey = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const stepTitle = useMemo(() => {
    const map: Record<(typeof STEPS)[number], string> = {
      purpose: pt("wizardPurposeTitle"),
      type: pt("wizardTypeTitle"),
      details: pt("wizardDetailsTitle"),
      location: pt("wizardLocationTitle"),
      pricing: pt("wizardPricingTitle"),
      photos: pt("wizardPhotosTitle"),
      review: pt("wizardReviewTitle"),
    };
    return map[stepKey];
  }, [pt, stepKey]);

  const patch = (partial: Partial<PropertyListingDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const locationReady = Boolean(
    draft.countryId &&
      draft.provinceId &&
      draft.cityRefId &&
      draft.latitude != null &&
      draft.longitude != null,
  );

  const canContinue = (): boolean => {
    switch (stepKey) {
      case "purpose":
        return Boolean(draft.purpose);
      case "type":
        return Boolean(draft.propertyType);
      case "details":
        return draft.title.trim().length >= 3;
      case "location":
        return locationReady;
      case "pricing":
        return Boolean(draft.price.trim());
      case "photos":
        return true;
      case "review":
        return locationReady && Boolean(draft.price.trim() && draft.title.trim());
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canContinue()) {
      Alert.alert(
        pt("fillAllFields"),
        stepKey === "location"
          ? "Select country, region, and city (or pin a map location) before continuing."
          : undefined,
      );
      return;
    }
    patch({
      step: Math.min(step + 1, STEPS.length - 1),
      ...(stepKey === "location" && !draft.locationConfirmed
        ? { locationConfirmed: true }
        : {}),
    });
  };

  const goBack = () => {
    if (step === 0) {
      navigation.goBack();
      return;
    }
    patch({ step: step - 1 });
  };

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(pt("listingFailed"), pt("fillAllFields"));
      return;
    }
    const remaining = 12 - draft.photos.length;
    if (remaining <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (result.canceled) return;
    const next = result.assets.map((asset, index) =>
      assetFromPicker(asset, `property_${Date.now()}_${index}`),
    );
    patch({ photos: [...draft.photos, ...next].slice(0, 12) });
  };

  const submit = async () => {
    if (
      !draft.purpose ||
      !draft.propertyType ||
      !draft.title.trim() ||
      !draft.price.trim() ||
      !draft.countryId ||
      !draft.provinceId ||
      !draft.cityRefId ||
      draft.latitude == null ||
      draft.longitude == null
    ) {
      Alert.alert(
        pt("fillAllFields"),
        "Complete the location step (country, region, city + map pin) before submitting for approval.",
      );
      return;
    }
    const listingType = (draft.listingType ||
      listingTypeFromPurpose(draft.purpose)) as PropertyListingType;
    const price = draft.price.trim().replace(",", "");
    const deposit = draft.deposit.trim().replace(",", "");
    try {
      await createListing({
        title: draft.title.trim(),
        description: draft.description.trim(),
        city: draft.city.trim() || "Unknown",
        suburb: draft.suburb.trim(),
        address:
          draft.address.trim() ||
          draft.street.trim() ||
          draft.formattedAddress.trim() ||
          draft.city.trim() ||
          "Address pending",
        street: draft.street.trim(),
        formattedAddress: draft.formattedAddress.trim(),
        country: draft.countryId,
        province: draft.provinceId,
        cityRef: draft.cityRefId,
        district: draft.districtId,
        latitude: draft.latitude,
        longitude: draft.longitude,
        showExactAddress: draft.showExactAddress,
        locationSource: draft.locationSource || "manual",
        price,
        listingType,
        propertyType: draft.propertyType,
        bedrooms: Number(draft.bedrooms) || 0,
        bathrooms: Number(draft.bathrooms) || 0,
        parkingSpaces: Number(draft.parkingSpaces) || 0,
        furnished: draft.furnished,
        parking: Number(draft.parkingSpaces) > 0,
        amenities: draft.amenities,
        currency: draft.currency || "AOA",
        isAvailable: true,
        images: draft.photos,
        purpose: draft.purpose || undefined,
        deposit: deposit || undefined,
        ...(draft.purpose === "rent"
          ? {
              monthlyRent: price,
              allowedLeaseMonths:
                draft.leaseMonths.length > 0 ? draft.leaseMonths : [6, 12],
            }
          : {}),
        ...(draft.purpose === "stay"
          ? {
              pricePerNight: price,
              weekendPrice: draft.weekendPrice.trim().replace(",", "") || undefined,
              cleaningFee: draft.cleaningFee.trim().replace(",", "") || undefined,
              minNights: Number(draft.minNights) || 1,
              maxGuests: Number(draft.maxGuests) || 1,
            }
          : {}),
      }).unwrap();
      await clearPropertyDraft();
      setDraft(emptyPropertyDraft());
      Alert.alert(pt("listingSubmitted"));
      navigation.navigate("PropertyListings");
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? JSON.stringify((error as { data: unknown }).data)
          : pt("listingFailed");
      Alert.alert(pt("listingFailed"), message);
    }
  };

  if (!hydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={propertyTheme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={propertyTheme.text} />
        </Pressable>
        <View style={styles.topMeta}>
          <Text style={styles.stepOf}>
            {pt("wizardStepOf")
              .replace("{{current}}", String(step + 1))
              .replace("{{total}}", String(STEPS.length))}
          </Text>
          <Text style={styles.stepTitle}>{stepTitle}</Text>
        </View>
        {savedFlash ? (
          <Text style={styles.saved}>{pt("savedAutomatically")}</Text>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {stepKey === "purpose" && (
          <View style={styles.choiceGrid}>
            <Text style={styles.lead}>{pt("wizardPurposeSubtitle")}</Text>
            {(
              [
                { key: "rent" as const, icon: "home-outline", label: pt("purposeRent") },
                { key: "stay" as const, icon: "bed-outline", label: pt("purposeStay") },
                { key: "sale" as const, icon: "cash-outline", label: pt("purposeSale") },
              ] as const
            ).map((option) => {
              const active = draft.purpose === option.key;
              return (
                <Pressable
                  key={option.key}
                  style={[styles.choiceCard, active && styles.choiceCardActive]}
                  onPress={() =>
                    patch({
                      purpose: option.key,
                      listingType: listingTypeFromPurpose(option.key) as PropertyListingType,
                    })
                  }
                >
                  <Ionicons
                    name={option.icon}
                    size={28}
                    color={active ? propertyTheme.primary : propertyTheme.textMuted}
                  />
                  <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {stepKey === "type" && (
          <View style={styles.chipWrap}>
            {propertyTypes.map((type) => {
              const active = draft.propertyType === type;
              return (
                <Pressable
                  key={type}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => patch({ propertyType: type })}
                >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {propertyTypeLabel(type)}
                </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {stepKey === "details" && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder={pt("listingTitle")}
              placeholderTextColor={propertyTheme.textMuted}
              value={draft.title}
              onChangeText={(title) => patch({ title })}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder={pt("listingDescription")}
              placeholderTextColor={propertyTheme.textMuted}
              value={draft.description}
              onChangeText={(description) => patch({ description })}
              multiline
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.half]}
                placeholder={pt("bedroomsLabel")}
                placeholderTextColor={propertyTheme.textMuted}
                keyboardType="numeric"
                value={draft.bedrooms}
                onChangeText={(bedrooms) => patch({ bedrooms })}
              />
              <TextInput
                style={[styles.input, styles.half]}
                placeholder={pt("bathroomsLabel")}
                placeholderTextColor={propertyTheme.textMuted}
                keyboardType="numeric"
                value={draft.bathrooms}
                onChangeText={(bathrooms) => patch({ bathrooms })}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.half]}
                placeholder={pt("parkingSpaces")}
                placeholderTextColor={propertyTheme.textMuted}
                keyboardType="numeric"
                value={draft.parkingSpaces}
                onChangeText={(parkingSpaces) => patch({ parkingSpaces })}
              />
              <TextInput
                style={[styles.input, styles.half]}
                placeholder={pt("areaLabel")}
                placeholderTextColor={propertyTheme.textMuted}
                keyboardType="numeric"
                value={draft.areaSqm}
                onChangeText={(areaSqm) => patch({ areaSqm })}
              />
            </View>
            <Pressable
              style={[styles.toggle, draft.furnished && styles.toggleOn]}
              onPress={() => patch({ furnished: !draft.furnished })}
            >
              <Text style={[styles.toggleText, draft.furnished && styles.toggleTextOn]}>
                {pt("furnished")}
              </Text>
            </Pressable>
          </View>
        )}

        {stepKey === "location" && (
          <View style={styles.form}>
            <PropertyLocationPicker
              value={{
                countryId: draft.countryId,
                provinceId: draft.provinceId,
                cityRefId: draft.cityRefId,
                districtId: draft.districtId,
                latitude: draft.latitude,
                longitude: draft.longitude,
                street: draft.street,
                formattedAddress: draft.formattedAddress,
                showExactAddress: draft.showExactAddress,
                locationSource: draft.locationSource,
                locationConfirmed: draft.locationConfirmed,
                city: draft.city,
                suburb: draft.suburb,
                address: draft.address,
              }}
              onChange={(next) => patch(next)}
            />
          </View>
        )}

        {stepKey === "pricing" && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder={
                draft.purpose === "stay"
                  ? pt("nightlyPriceLabel")
                  : draft.purpose === "rent"
                    ? pt("monthlyRentLabel")
                    : pt("listingPrice")
              }
              placeholderTextColor={propertyTheme.textMuted}
              keyboardType="numeric"
              value={draft.price}
              onChangeText={(price) => patch({ price })}
            />
            <TextInput
              style={styles.input}
              placeholder={pt("currencyLabel")}
              placeholderTextColor={propertyTheme.textMuted}
              value={draft.currency}
              onChangeText={(currency) => patch({ currency: currency.toUpperCase() })}
              maxLength={3}
            />
            {draft.purpose !== "stay" ? (
              <TextInput
                style={styles.input}
                placeholder={pt("depositLabel")}
                placeholderTextColor={propertyTheme.textMuted}
                keyboardType="numeric"
                value={draft.deposit}
                onChangeText={(deposit) => patch({ deposit })}
              />
            ) : null}
            {draft.purpose === "stay" ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder={pt("weekendPriceLabel")}
                  placeholderTextColor={propertyTheme.textMuted}
                  keyboardType="numeric"
                  value={draft.weekendPrice}
                  onChangeText={(weekendPrice) => patch({ weekendPrice })}
                />
                <TextInput
                  style={styles.input}
                  placeholder={pt("cleaningFeeLabel")}
                  placeholderTextColor={propertyTheme.textMuted}
                  keyboardType="numeric"
                  value={draft.cleaningFee}
                  onChangeText={(cleaningFee) => patch({ cleaningFee })}
                />
                <TextInput
                  style={styles.input}
                  placeholder={pt("minNightsLabel")}
                  placeholderTextColor={propertyTheme.textMuted}
                  keyboardType="numeric"
                  value={draft.minNights}
                  onChangeText={(minNights) => patch({ minNights })}
                />
                <TextInput
                  style={styles.input}
                  placeholder={pt("maxGuestsLabel")}
                  placeholderTextColor={propertyTheme.textMuted}
                  keyboardType="numeric"
                  value={draft.maxGuests}
                  onChangeText={(maxGuests) => patch({ maxGuests })}
                />
              </>
            ) : null}
            {draft.purpose === "rent" ? (
              <View>
                <Text style={styles.sectionLabel}>{pt("allowedLeaseMonthsLabel")}</Text>
                <View style={styles.chipWrap}>
                  {[6, 12].map((months) => {
                    const active = draft.leaseMonths.includes(months);
                    return (
                      <Pressable
                        key={months}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() =>
                          patch({
                            leaseMonths: active
                              ? draft.leaseMonths.filter((item) => item !== months)
                              : [...draft.leaseMonths, months].sort((a, b) => a - b),
                          })
                        }
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {pt("monthsChip").replace("{{n}}", String(months))}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
        )}

        {stepKey === "photos" && (
          <View style={styles.form}>
            <Pressable style={styles.uploadBox} onPress={() => void pickPhotos()}>
              <Ionicons name="cloud-upload-outline" size={28} color={propertyTheme.primary} />
              <Text style={styles.uploadText}>{pt("addPhotos")}</Text>
              <Text style={styles.uploadHint}>{pt("mediaHint")}</Text>
            </Pressable>
            {draft.photos.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
                {draft.photos.map((photo, index) => (
                  <View key={photo.uri} style={styles.photoWrap}>
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                    {index === 0 ? (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverText}>{pt("coverPhoto")}</Text>
                      </View>
                    ) : null}
                    <Pressable
                      style={styles.removePhoto}
                      onPress={() =>
                        patch({ photos: draft.photos.filter((item) => item.uri !== photo.uri) })
                      }
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            ) : null}

            <Text style={styles.sectionLabel}>{pt("amenities")}</Text>
            <View style={styles.chipWrap}>
              {amenities.map((item) => {
                const active = draft.amenities.includes(item.key);
                return (
                  <Pressable
                    key={item.key}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() =>
                      patch({
                        amenities: active
                          ? draft.amenities.filter((key) => key !== item.key)
                          : [...draft.amenities, item.key],
                      })
                    }
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{amenityLabel(item.key)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {stepKey === "review" && (
          <View style={styles.reviewCard}>
            <Text style={styles.lead}>{pt("reviewSummary")}</Text>
            <Text style={styles.reviewTitle}>{draft.title || "—"}</Text>
            <Text style={styles.reviewMeta}>
              {purposeLabel(draft.purpose)} · {propertyTypeLabel(draft.propertyType)}
            </Text>
            <Text style={styles.reviewMeta}>
              {draft.formattedAddress ||
                [draft.street, draft.suburb, draft.city].filter(Boolean).join(", ") ||
                draft.city}
            </Text>
            <Text style={styles.reviewPrice}>
              {draft.currency} {draft.price}
            </Text>
            <Text style={styles.reviewMeta}>
              {draft.bedrooms} {pt("bedroomsLabel").toLowerCase()} · {draft.bathrooms}{" "}
              {pt("bathroomsLabel").toLowerCase()} · {draft.photos.length} {pt("photoCount")}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {stepKey === "review" ? (
          <Pressable
            style={[styles.primaryFooter, (creating || !canContinue()) && styles.disabled]}
            disabled={creating || !canContinue()}
            onPress={() => void submit()}
          >
            <Text style={styles.primaryFooterText}>
              {creating ? "…" : pt("submitForApproval")}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.primaryFooter, !canContinue() && styles.disabled]}
            onPress={goNext}
          >
            <Text style={styles.primaryFooterText}>{pt("nextStep")}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: propertyTheme.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: "#fff",
  },
  backBtn: { padding: 8 },
  topMeta: { flex: 1 },
  stepOf: { fontSize: 11, fontWeight: "700", color: propertyTheme.textMuted },
  stepTitle: { fontSize: 16, fontWeight: "800", color: propertyTheme.text },
  saved: { fontSize: 10, color: propertyTheme.success, fontWeight: "700", maxWidth: 90 },
  progressTrack: { height: 4, backgroundColor: "#e2e8f0" },
  progressFill: { height: 4, backgroundColor: propertyTheme.primary },
  content: { padding: 16, paddingBottom: 120 },
  lead: { color: propertyTheme.textMuted, marginBottom: 16, lineHeight: 20 },
  choiceGrid: { gap: 12 },
  choiceCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: propertyTheme.border,
    alignItems: "center",
    gap: 10,
  },
  choiceCardActive: {
    borderColor: propertyTheme.primary,
    backgroundColor: "#ecfdf5",
  },
  choiceLabel: { fontSize: 16, fontWeight: "700", color: propertyTheme.textSecondary },
  choiceLabelActive: { color: propertyTheme.primary },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: propertyTheme.border,
  },
  chipActive: { backgroundColor: propertyTheme.primary, borderColor: propertyTheme.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: propertyTheme.textSecondary, textTransform: "capitalize" },
  chipTextActive: { color: "#fff" },
  form: { gap: 10 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: propertyTheme.text,
  },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  toggle: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: propertyTheme.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  toggleOn: { backgroundColor: propertyTheme.primary, borderColor: propertyTheme.primary },
  toggleText: { fontWeight: "700", color: propertyTheme.textSecondary },
  toggleTextOn: { color: "#fff" },
  uploadBox: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: propertyTheme.primary,
    backgroundColor: "#ecfdf5",
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  uploadText: { fontWeight: "800", color: propertyTheme.primary },
  uploadHint: { fontSize: 12, color: propertyTheme.textMuted, textAlign: "center" },
  photoRow: { marginTop: 12 },
  photoWrap: { width: 110, marginRight: 10 },
  photo: { width: 110, height: 84, borderRadius: 12, backgroundColor: "#e2e8f0" },
  coverBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    backgroundColor: "rgba(15,23,42,0.8)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  coverText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  removePhoto: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(15,23,42,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    color: propertyTheme.textMuted,
    textTransform: "uppercase",
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: propertyTheme.border,
  },
  reviewTitle: { fontSize: 22, fontWeight: "800", color: propertyTheme.text, marginBottom: 6 },
  reviewMeta: { color: propertyTheme.textMuted, marginTop: 4 },
  reviewPrice: { marginTop: 12, fontSize: 22, fontWeight: "800", color: propertyTheme.primary },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: propertyTheme.border,
  },
  primaryFooter: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryFooterText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  disabled: { opacity: 0.5 },
});
