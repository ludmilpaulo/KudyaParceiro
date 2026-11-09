import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { fetchFoodPartnerOrders, fetchFoodPartnerStore } from '../../features/food/api/foodPartnerApi';
import type { FoodOrderCard, FoodPartnerMe, FoodPartnerTab } from '../../features/food/api/foodTypes';
import {
  FOOD_PARTNER_TABS,
  extractApiErrorDetail,
  hasFoodCapability,
  statusLabelKey,
  tabLabelKey,
} from '../../features/food/foodHelpers';
import { useFoodTranslation } from '../../hooks/useFoodTranslation';
import { scheduleLocalNotification } from '../../utils/localNotifications';
import FoodOrderDetailModal from './FoodOrderDetailModal';

const POLL_MS = 20000;

type Props = {
  me: FoodPartnerMe;
};

export default function FoodOrdersBoard({ me }: Props) {
  const { ft } = useFoodTranslation();
  const [tab, setTab] = useState<FoodPartnerTab>('new');
  const [orders, setOrders] = useState<FoodOrderCard[]>([]);
  const [counts, setCounts] = useState<Partial<Record<FoodPartnerTab, number>>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [defaultPrep, setDefaultPrep] = useState<number | null>(null);
  const lastNewCount = useRef<number | null>(null);
  const pageRef = useRef(1);
  const tabRef = useRef<FoodPartnerTab>('new');
  const loadedOnce = useRef(false);

  const canViewOrders = hasFoodCapability(me, 'view_orders');

  useEffect(() => {
    let cancelled = false;
    fetchFoodPartnerStore()
      .then((store) => {
        if (!cancelled) setDefaultPrep(store.preparation_time_minutes ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const notifyIfNewOrders = useCallback(
    (nextNew: number | undefined) => {
      if (typeof nextNew !== 'number') return;
      const previous = lastNewCount.current;
      lastNewCount.current = nextNew;
      if (previous === null || nextNew <= previous) return;
      const added = nextNew - previous;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      void scheduleLocalNotification({
        title: ft('foodNewOrderTitle'),
        body: ft('foodNewOrderBody', { count: added }),
        sound: true,
      });
    },
    [ft],
  );

  const load = useCallback(
    async (mode: 'initial' | 'refresh' | 'poll' | 'more') => {
      if (!canViewOrders) return;
      const activeTab = tabRef.current;
      const nextPage = mode === 'more' ? pageRef.current + 1 : 1;
      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      if (mode === 'more') setLoadingMore(true);
      try {
        const data = await fetchFoodPartnerOrders({ tab: activeTab, page: nextPage });
        if (tabRef.current !== activeTab) return;
        setCounts(data.counts);
        notifyIfNewOrders(data.counts.new);
        // Polling keeps extra loaded pages instead of collapsing the list back to page 1.
        if (mode === 'poll' && pageRef.current > 1) return;
        setTotal(data.count);
        setOrders((current) => (mode === 'more' ? [...current, ...data.results] : data.results));
        pageRef.current = nextPage;
        setPage(nextPage);
        setError(null);
      } catch (err) {
        if (mode !== 'poll') setError(extractApiErrorDetail(err, ft('foodOrdersLoadFailed')));
      } finally {
        if (mode === 'initial' && tabRef.current === activeTab) setLoading(false);
        if (mode === 'refresh') setRefreshing(false);
        if (mode === 'more') setLoadingMore(false);
      }
    },
    [canViewOrders, ft, notifyIfNewOrders],
  );

  useFocusEffect(
    useCallback(() => {
      void load(loadedOnce.current ? 'poll' : 'initial');
      loadedOnce.current = true;
      const timer = setInterval(() => {
        void load('poll');
      }, POLL_MS);
      return () => clearInterval(timer);
    }, [load]),
  );

  const selectTab = (next: FoodPartnerTab) => {
    if (next === tabRef.current) return;
    tabRef.current = next;
    pageRef.current = 1;
    setTab(next);
    setPage(1);
    setOrders([]);
    setError(null);
    void load('initial');
  };

  if (!canViewOrders) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{ft('foodNoOrderAccess')}</Text>
      </View>
    );
  }

  const renderCard = ({ item }: { item: FoodOrderCard }) => {
    const key = statusLabelKey(item.status);
    return (
      <Pressable style={styles.card} onPress={() => setSelectedId(item.id)} accessibilityRole="button">
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.number}</Text>
          <Text style={styles.cardStatus}>{key ? ft(key) : item.status_label ?? item.status}</Text>
        </View>
        <Text style={styles.cardMeta}>
          {item.fulfilment_type === 'pickup' ? ft('foodPickup') : ft('foodDelivery')} · {item.customer_name} ·{' '}
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {item.items_preview.length > 0 ? (
          <Text style={styles.cardItems} numberOfLines={2}>
            {item.items_preview.join(', ')}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <Text style={styles.cardMeta}>{ft('foodItemsCount', { count: Number(item.item_count) || 0 })}</Text>
          <Text style={styles.cardTotal}>
            {ft('foodTotal')}: {item.total}
          </Text>
        </View>
        {item.prep_estimate_minutes && (item.status === 'accepted' || item.status === 'preparing') ? (
          <Text style={styles.cardPrep}>{ft('foodPrepEstimate', { minutes: item.prep_estimate_minutes })}</Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.storeBar}>
        <Text style={styles.storeName}>{me.store.name}</Text>
        <Text style={styles.role}>{ft('foodRoleLabel', { role: me.role.replace(/_/g, ' ') })}</Text>
        {!me.store.is_approved ? <Text style={styles.warning}>{ft('foodStorePendingApproval')}</Text> : null}
        {me.store.is_approved && !me.store.accepting_orders ? (
          <Text style={styles.warning}>{ft('foodStoreNotAccepting')}</Text>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
      >
        {FOOD_PARTNER_TABS.map((item) => {
          const active = item === tab;
          const count = counts[item];
          return (
            <Pressable
              key={item}
              onPress={() => selectTab(item)}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {ft(tabLabelKey(item))}
                {typeof count === 'number' ? ` (${count})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0171CE" />
        </View>
      ) : error && orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={() => void load('initial')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{ft('foodRetry')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} />}
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
          ListEmptyComponent={<Text style={styles.empty}>{ft('foodOrdersEmpty')}</Text>}
          ListFooterComponent={
            orders.length < total ? (
              <Pressable
                onPress={() => void load('more')}
                disabled={loadingMore}
                style={[styles.primaryButton, styles.loadMore]}
              >
                {loadingMore ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>{ft('foodLoadMore')}</Text>
                )}
              </Pressable>
            ) : null
          }
          extraData={page}
        />
      )}

      <FoodOrderDetailModal
        orderId={selectedId}
        defaultPrepMinutes={defaultPrep}
        onClose={() => setSelectedId(null)}
        onChanged={() => void load(pageRef.current > 1 ? 'poll' : 'refresh')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  storeBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  storeName: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  role: { fontSize: 12, color: '#64748b', marginTop: 2, textTransform: 'capitalize' },
  warning: {
    marginTop: 8,
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: 8,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 13,
  },
  tabs: { flexGrow: 0, flexShrink: 0 },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 10 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#e2e8f0', marginHorizontal: 4 },
  tabActive: { backgroundColor: '#0171CE' },
  tabText: { color: '#334155', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  list: { padding: 12, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  cardStatus: { fontSize: 12, fontWeight: '700', color: '#1d4ed8' },
  cardMeta: { fontSize: 13, color: '#64748b', marginTop: 4 },
  cardItems: { fontSize: 14, color: '#334155', marginTop: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  cardTotal: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  cardPrep: { marginTop: 6, fontSize: 12, color: '#b45309' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: { color: '#64748b', textAlign: 'center' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 24 },
  error: { color: '#b91c1c', textAlign: 'center', marginBottom: 8 },
  primaryButton: { marginTop: 12, backgroundColor: '#0171CE', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  loadMore: { alignSelf: 'center', minWidth: 140 },
});
