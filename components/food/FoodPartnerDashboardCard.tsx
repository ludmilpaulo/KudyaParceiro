import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchFoodPartnerDashboard } from '../../features/food/api/foodPartnerApi';
import type { FoodPartnerDashboard, FoodPartnerTab } from '../../features/food/api/foodTypes';
import {
  extractApiErrorDetail,
  formatFoodMoney,
  isNotFoodMemberError,
  tabLabelKey,
} from '../../features/food/foodHelpers';
import { useFoodTranslation } from '../../hooks/useFoodTranslation';

const OPEN_TABS: readonly FoodPartnerTab[] = ['new', 'accepted', 'preparing', 'ready', 'with_courier'];

/** Renders nothing for accounts without a restaurant workspace or without dashboard access. */
export default function FoodPartnerDashboardCard() {
  const { ft } = useFoodTranslation();
  const [data, setData] = useState<FoodPartnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const hasData = useRef(false);

  const load = useCallback(async () => {
    if (!hasData.current) setLoading(true);
    try {
      const next = await fetchFoodPartnerDashboard();
      hasData.current = true;
      setData(next);
      setError(null);
    } catch (err) {
      if (isNotFoodMemberError(err)) {
        setHidden(true);
      } else {
        setError(extractApiErrorDetail(err, ft('foodDashLoadFailed')));
      }
    } finally {
      setLoading(false);
    }
  }, [ft]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (hidden) return null;

  if (loading && !data) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#0171CE" />
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.card}>
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={() => void load()} style={styles.retry}>
          <Text style={styles.retryText}>{ft('foodRetry')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!data) return null;

  const currency = data.currency;
  const openTotal = OPEN_TABS.reduce((sum, tab) => sum + (data.open?.[tab] ?? 0), 0);
  const popular = data.popular_products ?? [];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{ft('foodDashTitle')}</Text>
      <View style={styles.grid}>
        <Stat label={ft('foodDashOrders')} value={String(data.today?.orders ?? 0)} />
        <Stat label={ft('foodDashRevenue')} value={formatFoodMoney(data.today?.revenue, currency)} />
        <Stat label={ft('foodDashOpen')} value={String(openTotal)} />
        <Stat
          label={ft('foodDashRating')}
          value={data.rating?.average != null ? `★ ${data.rating.average}` : ft('foodDashNoRating')}
          hint={data.rating?.count ? ft('foodDashRatingCount', { count: data.rating.count }) : undefined}
        />
        <Stat label={ft('foodDashCompleted')} value={String(data.today?.completed ?? 0)} />
        <Stat label={ft('foodDashCancelled')} value={String(data.today?.cancelled ?? 0)} />
        {data.outstanding_payouts !== undefined ? (
          <Stat label={ft('foodDashOutstanding')} value={formatFoodMoney(data.outstanding_payouts, currency)} />
        ) : null}
      </View>

      {openTotal > 0 ? (
        <View style={styles.openRow}>
          {OPEN_TABS.map((tab) => (
            <Text key={tab} style={styles.openChip}>
              {ft(tabLabelKey(tab))}: {data.open?.[tab] ?? 0}
            </Text>
          ))}
        </View>
      ) : null}

      <Text style={styles.subtitle}>{ft('foodDashPopular')}</Text>
      {popular.length === 0 ? (
        <Text style={styles.muted}>{ft('foodDashNoPopular')}</Text>
      ) : (
        popular.map((product) => (
          <View key={product.name} style={styles.popularRow}>
            <Text style={styles.popularName} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.popularMeta}>
              × {product.quantity} · {formatFoodMoney(product.revenue, currency)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 16, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  stat: { width: '50%', padding: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b' },
  statHint: { fontSize: 11, color: '#94a3b8' },
  openRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  openChip: {
    fontSize: 12,
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  subtitle: { marginTop: 14, marginBottom: 4, fontSize: 13, fontWeight: '800', color: '#475569' },
  muted: { color: '#64748b', fontStyle: 'italic' },
  popularRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  popularName: { flex: 1, color: '#0f172a', fontWeight: '600' },
  popularMeta: { color: '#475569', marginLeft: 8 },
  error: { color: '#be123c' },
  retry: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#0171CE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  retryText: { color: '#fff', fontWeight: '700' },
});
