import React from 'react';
import PageSpinner from '../components/ui/PageSpinner';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import { getPartnerCategorySlug, getPartnerDashboardKind, getUserRole } from '../utils/partnerRoles';
import { useGetPartnerMeQuery } from '../redux/slices/partnerApi';
import type { PartnerType } from '../types/partner';
import RestaurantDrawer from './RestaurantDrawer';
import GroceryTabNavigator from './GroceryTabNavigator';
import CategoryPartnerDrawer from './CategoryPartnerDrawer';
import DoctorDrawer from './DoctorDrawer';
import PropertyDrawer from './PropertyDrawer';

function resolveDrawer(
  partnerType: PartnerType | null,
  categorySlug: string,
  role: string,
) {
  // Grocery is its own product — never reuse the restaurant drawer.
  if (categorySlug === 'grocery' || partnerType === 'grocery' || role === 'grocery_store_owner') {
    return <GroceryTabNavigator />;
  }
  if (categorySlug === 'property' || categorySlug === 'stay' || partnerType === 'property') {
    return <PropertyDrawer />;
  }
  if (partnerType === 'doctor' || categorySlug === 'doctor') {
    return <DoctorDrawer />;
  }
  if (categorySlug === 'grocery' || getPartnerDashboardKind(categorySlug) === 'grocery') {
    return <GroceryTabNavigator />;
  }
  if (partnerType === 'restaurant' || partnerType === 'shop') {
    return <RestaurantDrawer categorySlug={categorySlug} />;
  }
  if (
    partnerType === 'driver' ||
    partnerType === 'service_provider' ||
    partnerType === 'rental_partner'
  ) {
    return <CategoryPartnerDrawer categorySlug={categorySlug} />;
  }

  const kind = getPartnerDashboardKind(categorySlug, role);
  if (kind === 'grocery' || categorySlug === 'grocery') {
    return <GroceryTabNavigator />;
  }
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
  const role = getUserRole(user || {});
  const knownPartnerKind = getPartnerDashboardKind(categorySlug, role);
  const hasKnownPartnerKind =
    knownPartnerKind === 'doctor' ||
    knownPartnerKind === 'store' ||
    knownPartnerKind === 'grocery' ||
    role === 'doctor';

  const { data: partnerMe, isLoading, isError } = useGetPartnerMeQuery(undefined, {
    skip: !user,
  });

  if (user && isLoading && !hasKnownPartnerKind) {
    return <PageSpinner color="#0f766e" />;
  }

  const partnerType = !isError && partnerMe ? partnerMe.partnerType : null;
  return resolveDrawer(partnerType, categorySlug, role);
}
