import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import API from '../../services/api';
import { useTranslation } from '../../hooks/useTranslation';

type CollectionRow = {
  kudya_reference: string;
  created_at: string;
  amount: string;
  currency: string;
  method: string;
  commission: string;
  partner_amount: string;
  status: string;
  service_type: string;
};

type CollectionsResponse = {
  gross: string;
  commission: string;
  partner_amount: string;
  thunes_collected: string;
  refunds: string;
  count: number;
  payments: CollectionRow[];
};

type WithdrawalRow = {
  reference: string;
  amount: string;
  currency: string;
  method: string;
  status: string;
  created_at: string;
};

type WithdrawalsResponse = {
  provider_payouts_available: boolean;
  withdrawals: WithdrawalRow[];
};

type Period = 'month' | 'days30' | 'all';

export function periodStart(period: Period, now: Date = new Date()): string | undefined {
  if (period === 'all') return undefined;
  const start =
    period === 'month'
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return start.toISOString().slice(0, 10);
}

export default function PartnerCollectionsScreen() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('month');
  const [data, setData] = useState<CollectionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payouts, setPayouts] = useState<WithdrawalsResponse | null>(null);

  useEffect(() => {
    API.get<WithdrawalsResponse>('/api/financial/withdrawals/')
      .then((response) => setPayouts(response.data))
      .catch(() => setPayouts(null));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const from = periodStart(period);
      const response = await API.get<CollectionsResponse>('/api/payments/partner/collections/', {
        params: from ? { from } : undefined,
      });
      setData(response.data);
    } catch {
      setError(t('collectionsLoadFailed', 'Collections could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [period, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const periods: Array<[Period, string]> = [
    ['month', t('collectionsThisMonth', 'This month')],
    ['days30', t('collectionsLast30', 'Last 30 days')],
    ['all', t('collectionsAll', 'All time')],
  ];
  const currency = data?.payments[0]?.currency ?? '';
  const summary: Array<[string, string]> = data
    ? [
        [t('collectionsGross', 'Collected'), data.gross],
        [t('collectionsCommission', 'Kudya commission'), data.commission],
        [t('collectionsRefunds', 'Refunded'), data.refunds],
        [t('collectionsNet', 'Your share'), data.partner_amount],
        [t('thunesCollected', 'Thunes collected'), data.thunes_collected],
      ]
    : [];

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={data?.payments ?? []}
      keyExtractor={(row) => row.kudya_reference}
      refreshControl={<RefreshControl refreshing={loading && Boolean(data)} onRefresh={() => void load()} />}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>{t('collectionsTitle', 'Payment collections')}</Text>
          <Text style={styles.muted}>
            {t('collectionsHint', 'Payments Kudya has verified with the provider for your services.')}
          </Text>
          <View style={styles.row}>
            {periods.map(([value, label]) => (
              <Pressable
                key={value}
                onPress={() => setPeriod(value)}
                accessibilityRole="button"
                accessibilityState={{ selected: period === value }}
                style={[styles.chip, period === value && styles.chipOn]}
              >
                <Text style={period === value ? styles.chipTextOn : styles.chipText}>{label}</Text>
              </Pressable>
            ))}
          </View>
          {loading && !data ? <ActivityIndicator style={styles.spacer} color="#0f766e" /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.grid}>
            {summary.map(([label, value]) => (
              <View key={label} style={styles.card}>
                <Text style={styles.muted}>{label}</Text>
                <Text style={styles.value}>
                  {value} {currency}
                </Text>
              </View>
            ))}
          </View>
          {payouts?.provider_payouts_available ? (
            <View>
              <Text style={styles.section}>{t('collectionsWithdrawals', 'Withdrawals')}</Text>
              {payouts.withdrawals.length === 0 ? (
                <Text style={styles.muted}>{t('collectionsNoWithdrawals', 'No withdrawals yet.')}</Text>
              ) : (
                payouts.withdrawals.slice(0, 10).map((row) => (
                  <View key={row.reference} style={[styles.item, styles.spacedItem]}>
                    <View style={styles.itemRow}>
                      <Text style={styles.reference}>{row.reference}</Text>
                      <Text style={styles.value}>
                        {row.amount} {row.currency}
                      </Text>
                    </View>
                    <Text style={styles.muted}>
                      {row.created_at.slice(0, 10)} · {row.method} · {row.status}
                    </Text>
                  </View>
                ))
              )}
            </View>
          ) : null}
          {data ? (
            <Text style={styles.section}>
              {t('collectionsPayments', 'Payments')} ({data.count})
            </Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        data && !loading ? (
          <Text style={styles.muted}>{t('collectionsEmpty', 'No verified payments in this period.')}</Text>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.itemRow}>
            <Text style={styles.reference}>{item.kudya_reference}</Text>
            <Text style={styles.value}>
              {item.amount} {item.currency}
            </Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.muted}>
              {item.created_at.slice(0, 10)} · {item.service_type} · {item.status}
            </Text>
            <Text style={styles.muted}>
              {t('collectionsNet', 'Your share')}: {item.partner_amount}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  muted: { color: '#64748b', fontSize: 13 },
  error: { color: '#dc2626', marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#e2e8f0' },
  chipOn: { backgroundColor: '#0f766e' },
  chipText: { color: '#0f172a', fontWeight: '600' },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  spacer: { marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  card: { flexGrow: 1, flexBasis: '45%', backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  value: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  section: { marginTop: 16, fontWeight: '700', color: '#0f172a' },
  spacedItem: { marginTop: 8 },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', gap: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  reference: { fontFamily: 'monospace', color: '#0f172a', flexShrink: 1 },
});
