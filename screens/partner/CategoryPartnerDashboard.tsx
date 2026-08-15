import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { useTranslation } from '../../hooks/useTranslation';
import { theme } from '../../configs/theme';
import { getPartnerCategorySlug } from '../../utils/partnerRoles';
import ServicesPartnerDashboard from './ServicesPartnerDashboard';
import RentalPartnerDashboard from './RentalPartnerDashboard';
import BusinessPartnerDashboard from './BusinessPartnerDashboard';

const PRIVACY_URL = 'https://sd-kudya.vercel.app/PrivacyPolicy';
const TERMS_URL = 'https://sd-kudya.vercel.app/TermsOfService';

type Props = {
  categorySlug: string;
  categoryName?: string;
  categoryColor?: string;
  featureKeys?: string[];
};

export default function CategoryPartnerDashboard({
  categorySlug,
  categoryName,
  categoryColor = theme.colors.primary,
}: Props) {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const slug =
    getPartnerCategorySlug((user || {}) as Parameters<typeof getPartnerCategorySlug>[0]) ||
    categorySlug;

  if (slug === 'services' || slug === 'service') {
    return <ServicesPartnerDashboard />;
  }
  if (slug === 'car_rental') {
    return <RentalPartnerDashboard />;
  }
  if (slug === 'business' || slug === 'business_admin') {
    return <BusinessPartnerDashboard />;
  }
  if (slug === 'courier') {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <LinearGradient colors={[categoryColor, theme.colors.primaryDark]} style={styles.hero}>
          <Text style={styles.heroBadge}>{categoryName || slug}</Text>
          <Text style={styles.heroTitle}>{t('sendPackage', 'Send Package')}</Text>
          <Text style={styles.heroSubtitle}>
            {t(
              'courierPartnerHint',
              'Parcel jobs are handled in the driver shell. Go online with GPS to accept deliveries — there is no separate courier-company dashboard.',
            )}
          </Text>
        </LinearGradient>
      </ScrollView>
    );
  }
  const businessName =
    (user as { business_profile?: { businessName?: string }; username?: string } | null)
      ?.business_profile?.businessName ||
    (user as { username?: string } | null)?.username ||
    t('partnerAppName');

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <LinearGradient colors={[categoryColor, theme.colors.primaryDark]} style={styles.hero}>
        <Text style={styles.heroBadge}>{categoryName || slug}</Text>
        <Text style={styles.heroTitle}>{businessName}</Text>
        <Text style={styles.heroSubtitle}>
          {t(
            'categoryComingSoonSubtitle',
            'Partner tools for this category are coming soon. Your account is saved and linked.',
          )}
        </Text>
      </LinearGradient>

      <View style={styles.comingSoonCard}>
        <Feather name="clock" size={28} color={categoryColor} />
        <Text style={styles.comingSoonTitle}>
          {t('comingSoon', 'Coming soon')}
        </Text>
        <Text style={styles.comingSoonBody}>
          {t(
            'categoryDashboardNote',
            'Full module features are rolling out per category. Restaurant, grocery, doctor, property, and driver tools are available today for those partner types.',
          )}
        </Text>
      </View>

      <TouchableOpacity style={styles.linkRow} onPress={() => void Linking.openURL(PRIVACY_URL)}>
        <Feather name="shield" size={18} color={theme.colors.primary} />
        <Text style={styles.linkText}>{t('privacyPolicy', 'Privacy Policy')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkRow} onPress={() => void Linking.openURL(TERMS_URL)}>
        <Feather name="file-text" size={18} color={theme.colors.primary} />
        <Text style={styles.linkText}>{t('termsOfService', 'Terms of Service')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingBottom: 32 },
  hero: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    marginBottom: 8,
    overflow: 'hidden',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  comingSoonCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 10,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  comingSoonBody: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: theme.spacing.lg,
    marginBottom: 10,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
