import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { useTranslation } from '../../hooks/useTranslation';
import { theme } from '../../configs/theme';
import { getPartnerCategorySlug } from '../../utils/partnerRoles';

const FEATURE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  menu_management: 'book-open',
  product_management: 'package',
  orders: 'shopping-bag',
  bookings: 'calendar',
  property_listings: 'home',
  room_listings: 'home',
  appointments: 'clock',
  revenue: 'trending-up',
  reviews: 'star',
  business_profile: 'user',
  stock_management: 'layers',
  delivery_settings: 'truck',
  promotions: 'tag',
  enquiries: 'mail',
  agents: 'users',
  availability_calendar: 'calendar',
  pricing: 'dollar-sign',
  guests: 'users',
};

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
  featureKeys = [],
}: Props) {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const slug = getPartnerCategorySlug((user || {}) as Parameters<typeof getPartnerCategorySlug>[0]) || categorySlug;
  const businessName =
    (user as { business_profile?: { businessName?: string }; username?: string } | null)?.business_profile
      ?.businessName ||
    (user as { username?: string } | null)?.username ||
    t('partnerAppName');

  const features = useMemo(() => {
    if (featureKeys.length > 0) return featureKeys;
    return ['orders', 'bookings', 'revenue', 'business_profile'];
  }, [featureKeys]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[categoryColor, theme.colors.primaryDark]}
        style={styles.hero}
      >
        <Text style={styles.heroBadge}>{categoryName || slug}</Text>
        <Text style={styles.heroTitle}>{businessName}</Text>
        <Text style={styles.heroSubtitle}>{t('categoryDashboardSubtitle')}</Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>{t('categoryDashboardFeatures')}</Text>
      <View style={styles.grid}>
        {features.map((key) => (
          <View key={key} style={styles.featureTile}>
            <View style={[styles.featureIcon, { backgroundColor: `${categoryColor}18` }]}>
              <Feather
                name={FEATURE_ICONS[key] || 'grid'}
                size={20}
                color={categoryColor}
              />
            </View>
            <Text style={styles.featureLabel}>{t(`feature_${key}` as never, key.replace(/_/g, ' '))}</Text>
          </View>
        ))}
      </View>

      <View style={styles.noteCard}>
        <Feather name="info" size={18} color={theme.colors.primary} />
        <Text style={styles.noteText}>{t('categoryDashboardNote')}</Text>
      </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    gap: 10,
  },
  featureTile: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  noteCard: {
    flexDirection: 'row',
    gap: 10,
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: '#EFF6FF',
    borderRadius: theme.radius.lg,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
});
