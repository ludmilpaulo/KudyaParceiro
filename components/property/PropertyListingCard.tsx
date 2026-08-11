import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { PropertyListing } from "../../types/property";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";
import PropertyStatusBadge from "./PropertyStatusBadge";
import {
  getListingUiStatus,
  purposeFromListingType,
  propertyTheme,
} from "./propertyUi";

type Props = {
  listing: PropertyListing;
  onManage: () => void;
  onToggleAvailability?: () => void;
  onManageStay?: () => void;
};

export default function PropertyListingCard({
  listing,
  onManage,
  onToggleAvailability,
  onManageStay,
}: Props) {
  const { pt, listingTypeLabel } = usePropertyTranslation();
  const cover = listing.images[0]?.url;
  const purpose = listing.purpose ?? purposeFromListingType(listing.listingType);
  const purposeLabel =
    purpose === "sale"
      ? pt("purposeSale")
      : purpose === "stay"
        ? pt("purposeStay")
        : pt("purposeRent");
  const location = [listing.suburb, listing.city].filter(Boolean).join(", ");
  const priceSuffix =
    listing.listingType === "rent_daily"
      ? ` / ${pt("perDayShort")}`
      : listing.listingType === "rent_monthly"
        ? ` / ${pt("perMonthShort")}`
        : "";
  const status = getListingUiStatus(listing);

  return (
    <Pressable style={styles.card} onPress={onManage}>
      <View style={styles.imageWrap}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="home-outline" size={40} color="#94a3b8" />
          </View>
        )}
        <View style={styles.imageTop}>
          <View style={styles.purposeChip}>
            <Text style={styles.purposeText}>{purposeLabel}</Text>
          </View>
          <PropertyStatusBadge status={status} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={propertyTheme.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {location || listing.city}
          </Text>
        </View>

        <View style={styles.metaRow}>
          {listing.bedrooms > 0 ? (
            <Text style={styles.metaItem}>🛏 {listing.bedrooms}</Text>
          ) : null}
          {listing.bathrooms > 0 ? (
            <Text style={styles.metaItem}>🚿 {listing.bathrooms}</Text>
          ) : null}
          <Text style={styles.metaItem}>{listingTypeLabel(listing.listingType)}</Text>
        </View>

        <Text style={styles.price}>
          {listing.currency} {listing.price}
          <Text style={styles.priceSuffix}>{priceSuffix}</Text>
        </Text>

        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            💬 {listing.enquiryCount} {pt("enquiries").toLowerCase()}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={onManage}>
            <Text style={styles.primaryBtnText}>{pt("manageProperty")}</Text>
          </Pressable>
          {purpose === "stay" && onManageStay ? (
            <Pressable style={styles.secondaryBtn} onPress={onManageStay}>
              <Text style={styles.secondaryBtnText}>{pt("manageStayAvailability")}</Text>
            </Pressable>
          ) : null}
          {onToggleAvailability && (status === "active" || status === "inactive") ? (
            <Pressable style={styles.secondaryBtn} onPress={onToggleAvailability}>
              <Text style={styles.secondaryBtnText}>
                {listing.isAvailable ? pt("pauseListing") : pt("activateListing")}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: propertyTheme.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: propertyTheme.border,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageWrap: { height: 180, backgroundColor: "#e2e8f0" },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  imageTop: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  purposeChip: {
    backgroundColor: "rgba(15,23,42,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  purposeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  body: { padding: 16 },
  title: { fontSize: 18, fontWeight: "800", color: propertyTheme.text },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  location: { flex: 1, color: propertyTheme.textMuted, fontSize: 13 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  metaItem: { color: propertyTheme.textSecondary, fontSize: 13, fontWeight: "600" },
  price: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "800",
    color: propertyTheme.primary,
  },
  priceSuffix: { fontSize: 13, fontWeight: "500", color: propertyTheme.textMuted },
  statsRow: { marginTop: 8 },
  statText: { fontSize: 12, color: propertyTheme.textMuted },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  primaryBtn: {
    backgroundColor: propertyTheme.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: propertyTheme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  secondaryBtnText: { color: propertyTheme.textSecondary, fontWeight: "600", fontSize: 13 },
});
