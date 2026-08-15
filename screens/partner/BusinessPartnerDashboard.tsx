import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchMyBusinesses, type PartnerBusiness } from '../../features/business/api';

export default function BusinessPartnerDashboard() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<PartnerBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBusinesses()
      .then(setRows)
      .catch(() => setError(t('unableToLoadData', 'Unable to load data')))
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>{t('business', 'Business')}</Text>
      <Text style={{ marginTop: 8, color: '#475569' }}>
        {t(
          'businessMembershipHint',
          'Memberships linked to this account. Invoicing and spend controls are not available yet.',
        )}
      </Text>
      {error ? <Text style={{ marginTop: 12, color: '#dc2626' }}>{error}</Text> : null}
      {rows.length === 0 && !error ? (
        <Text style={{ marginTop: 16, color: '#64748b' }}>
          {t('noBusinessAccounts', 'No business accounts are linked to this user yet.')}
        </Text>
      ) : null}
      {rows.map((row) => (
        <View key={row.id} style={{ marginTop: 12, backgroundColor: '#fff', padding: 14, borderRadius: 12 }}>
          <Text style={{ fontWeight: '700' }}>{row.name}</Text>
          <Text style={{ color: '#64748b', marginTop: 4 }}>
            {row.category_slug} · {row.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
