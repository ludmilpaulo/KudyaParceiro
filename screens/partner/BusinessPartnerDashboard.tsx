import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { theme } from '../../configs/theme';
import { fetchMyBusinesses, type LinkedBusiness } from '../../services/categoryPartnerApi';
import { fetchPartnerEarnings } from '../../features/partner/api/partnerDashboardApi';

export default function BusinessPartnerDashboard() {
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState<LinkedBusiness[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<{ available_balance: string; currency: string } | null>(null);

  useEffect(() => {
    fetchMyBusinesses()
      .then(setBusinesses)
      .catch(() => setError(t('loadFailed', 'Failed to load businesses.')));
    fetchPartnerEarnings()
      .then((data) => setEarnings({ available_balance: data.available_balance, currency: data.currency }))
      .catch(() => undefined);
  }, [t]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('business', 'Business')}</Text>
      <Text style={styles.subtitle}>
        {t('businessMembershipHint', 'Linked business memberships from the Kudya API. Invoicing is not part of this workspace.')}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {earnings ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('partnerEarnings', 'Earnings')}</Text>
          <Text style={styles.meta}>
            {earnings.currency} {earnings.available_balance}
          </Text>
        </View>
      ) : null}
      {businesses.length === 0 && !error ? (
        <Text style={styles.meta}>{t('noBusinesses', 'No linked businesses yet.')}</Text>
      ) : null}
      {businesses.map((business) => (
        <View key={business.id} style={styles.card}>
          <Text style={styles.cardTitle}>{business.name || business.legal_name || `#${business.id}`}</Text>
          <Text style={styles.meta}>{business.status || t('linked', 'Linked')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  subtitle: { color: theme.colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  error: { color: '#b91c1c', marginBottom: 8 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  cardTitle: { fontWeight: '700', color: theme.colors.text },
  meta: { color: theme.colors.textSecondary, marginTop: 4 },
});
