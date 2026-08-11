import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  getListingUiStatus,
  STATUS_BADGE_COLORS,
  type PropertyUiStatus,
} from "./propertyUi";
import type { PropertyListing } from "../../types/property";
import { usePropertyTranslation } from "../../hooks/usePropertyTranslation";

type Props = {
  listing?: PropertyListing;
  status?: PropertyUiStatus;
};

export default function PropertyStatusBadge({ listing, status }: Props) {
  const { pt } = usePropertyTranslation();
  const ui = status ?? (listing ? getListingUiStatus(listing) : "draft");
  const colors = STATUS_BADGE_COLORS[ui];

  const labels: Record<PropertyUiStatus, string> = {
    active: pt("statusActive"),
    pending: pt("statusPendingReview"),
    draft: pt("statusDraft"),
    inactive: pt("statusInactive"),
    rejected: pt("statusChangesRequired"),
    suspended: pt("statusSuspended"),
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <View style={[styles.dot, { backgroundColor: colors.dot }]} />
      <Text style={[styles.text, { color: colors.text }]}>{labels[ui]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 11, fontWeight: "700" },
});
