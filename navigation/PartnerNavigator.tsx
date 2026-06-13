import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import { getPartnerCategorySlug, getPartnerDashboardKind, getUserRole } from '../utils/partnerRoles';
import { useGetPartnerMeQuery } from '../redux/slices/partnerApi';
import type { PartnerType } from '../types/partner';
import RestaurantDrawer from './RestaurantDrawer';
import CategoryPartnerDrawer from './CategoryPartnerDrawer';
import DoctorDrawer from './DoctorDrawer';

function resolveDrawer(partnerType: PartnerType | null, categorySlug: string) {
  if (partnerType === 'doctor') {
    return <DoctorDrawer />;
  }
  if (partnerType === 'restaurant' || partnerType === 'shop') {
    return <RestaurantDrawer categorySlug={categorySlug} />;
  }
  if (
    partnerType === 'driver' ||
    partnerType === 'property' ||
    partnerType === 'service_provider' ||
    partnerType === 'rental_partner'
  ) {
    return <CategoryPartnerDrawer categorySlug={categorySlug} />;
  }

  const kind = getPartnerDashboardKind(categorySlug);
  if (kind === 'store') {
    return <RestaurantDrawer categorySlug={categorySlug} />;
  }
  if (kind === 'doctor') {
    return <DoctorDrawer />;
  }
  return <CategoryPartnerDrawer categorySlug={categorySlug} />;
}

export default function PartnerNavigator() {
  const user = useSelector(selectUser);
  const categorySlug = getPartnerCategorySlug(user) || 'business';
  const knownPartnerKind = getPartnerDashboardKind(categorySlug);
  const hasKnownPartnerKind =
    knownPartnerKind === 'doctor' ||
    knownPartnerKind === 'store' ||
    getUserRole(user) === 'doctor';

  const { data: partnerMe, isLoading, isError } = useGetPartnerMeQuery(undefined, {
    skip: !user,
  });

  if (user && isLoading && !hasKnownPartnerKind) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  const partnerType = !isError && partnerMe ? partnerMe.partnerType : null;
  return resolveDrawer(partnerType, categorySlug);
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
