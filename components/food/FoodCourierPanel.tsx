import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
  acceptFoodCourierOrder,
  deliverFoodCourierOrder,
  departFoodCourierOrder,
  failFoodCourierOrder,
  fetchFoodCourierActive,
  fetchFoodCourierAvailable,
  fetchFoodCourierEarnings,
  pickupFoodCourierOrder,
  releaseFoodCourierOrder,
} from '../../features/food/api/foodCourierApi';
import type { FoodCourierEarnings, FoodCourierOrder, FoodProofPhoto } from '../../features/food/api/foodTypes';
import {
  cleanReason,
  courierActionLabelKey,
  courierActionsFor,
  extractApiErrorDetail,
  formatFoodMoney,
  isValidPin,
  statusLabelKey,
  type FoodCourierAction,
} from '../../features/food/foodHelpers';
import { useFoodTranslation } from '../../hooks/useFoodTranslation';
import FoodPromptModal from './FoodPromptModal';

const POLL_MS = 20000;

type Props = {
  /** Courier is online for food delivery; the available pool is only polled while online. */
  online: boolean;
};

type Pending = { action: FoodCourierAction; order: FoodCourierOrder };

export default function FoodCourierPanel({ online }: Props) {
  const { ft } = useFoodTranslation();
  const [active, setActive] = useState<FoodCourierOrder[]>([]);
  const [available, setAvailable] = useState<FoodCourierOrder[]>([]);
  const [earnings, setEarnings] = useState<FoodCourierEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [earningsError, setEarningsError] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [proofPhoto, setProofPhoto] = useState<FoodProofPhoto | null>(null);

  const loadEarnings = useCallback(async () => {
    try {
      setEarnings(await fetchFoodCourierEarnings());
      setEarningsError(false);
    } catch {
      setEarningsError(true);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const [activeRows, availableRows] = await Promise.all([
        fetchFoodCourierActive(),
        online ? fetchFoodCourierAvailable() : Promise.resolve<FoodCourierOrder[]>([]),
      ]);
      setActive(activeRows);
      setAvailable(availableRows);
      setLoadError(null);
    } catch (error) {
      setLoadError(extractApiErrorDetail(error, ft('foodCourierLoadFailed')));
    } finally {
      setLoading(false);
    }
  }, [online, ft]);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
      void loadEarnings();
      const timer = setInterval(() => {
        void loadOrders();
      }, POLL_MS);
      return () => clearInterval(timer);
    }, [loadOrders, loadEarnings]),
  );

  const closePrompt = () => {
    setPending(null);
    setProofPhoto(null);
    setActionError(null);
  };

  const perform = async (order: FoodCourierOrder, task: () => Promise<unknown>) => {
    setBusyId(order.id);
    setActionError(null);
    try {
      await task();
      closePrompt();
      await loadOrders();
      void loadEarnings();
    } catch (error) {
      setActionError(extractApiErrorDetail(error, ft('foodActionFailed')));
    } finally {
      setBusyId(null);
    }
  };

  const startAction = (order: FoodCourierOrder, action: FoodCourierAction) => {
    setActionError(null);
    if (action === 'pickup') {
      void perform(order, () => pickupFoodCourierOrder(order.id));
      return;
    }
    if (action === 'depart') {
      void perform(order, () => departFoodCourierOrder(order.id));
      return;
    }
    setProofPhoto(null);
    setPending({ action, order });
  };

  const confirmPending = (value: string) => {
    if (!pending) return;
    const { action, order } = pending;
    if (action === 'release') {
      void perform(order, () => releaseFoodCourierOrder(order.id));
    } else if (action === 'deliver') {
      void perform(order, () => deliverFoodCourierOrder(order.id, value.trim(), proofPhoto));
    } else if (action === 'fail') {
      void perform(order, () => failFoodCourierOrder(order.id, cleanReason(value) ?? ''));
    }
  };

  const takeProofPhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setActionError(ft('foodCourierCameraDenied'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
      const asset = result.canceled ? null : result.assets?.[0];
      if (asset?.uri) {
        setProofPhoto({ uri: asset.uri, name: 'proof_photo.jpg', type: asset.mimeType || 'image/jpeg' });
        setActionError(null);
      }
    } catch (error) {
      setActionError(extractApiErrorDetail(error, ft('foodActionFailed')));
    }
  };

  const callNumber = (phone: string) => {
    const digits = phone.replace(/[^\d+]/g, '');
    if (digits) void Linking.openURL(`tel:${digits}`).catch(() => undefined);
  };

  const renderOrder = (order: FoodCourierOrder, assigned: boolean) => {
    const statusKey = statusLabelKey(order.status);
    const busy = busyId === order.id;
    const actions = assigned ? courierActionsFor(order.status) : [];
    return (
      <View key={`${assigned ? 'active' : 'pool'}-${order.id}`} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{order.number}</Text>
          <Text style={styles.status}>{statusKey ? ft(statusKey) : order.status}</Text>
        </View>
        <Text style={styles.earning}>{ft('foodCourierEarning', { amount: formatFoodMoney(order.earning, order.currency) })}</Text>
        <Text style={[styles.cash, order.collect_cash ? styles.cashCollect : styles.cashPaid]}>
          {order.collect_cash
            ? ft('foodCourierCollectCash', { amount: formatFoodMoney(order.total, order.currency) })
            : ft('foodCourierPaidOnline')}
        </Text>

        <Text style={styles.section}>{ft('foodCourierRestaurant')}</Text>
        <Text style={styles.body}>{order.restaurant.name}</Text>
        {order.restaurant.address ? <Text style={styles.body}>{order.restaurant.address}</Text> : null}
        {order.restaurant.phone ? (
          <Pressable onPress={() => callNumber(order.restaurant.phone ?? '')} style={styles.callButton}>
            <Text style={styles.callText}>
              {ft('foodCourierCall')} · {order.restaurant.phone}
            </Text>
          </Pressable>
        ) : null}

        {order.items.length > 0 ? (
          <>
            <Text style={styles.section}>{ft('foodCourierItems')}</Text>
            {order.items.map((item, index) => (
              <Text key={`${order.id}-item-${index}`} style={styles.body}>
                {item.quantity} × {item.name}
              </Text>
            ))}
          </>
        ) : null}

        {assigned && order.customer ? (
          <>
            <Text style={styles.section}>{ft('foodCourierDropoff')}</Text>
            <Text style={styles.body}>
              {ft('foodCourierCustomer')}: {order.customer.name}
            </Text>
            {order.customer.phone_masked ? (
              <Text style={styles.body}>
                {ft('foodCourierPhone')}: {order.customer.phone_masked}
              </Text>
            ) : null}
            {order.customer.address ? <Text style={styles.body}>{order.customer.address}</Text> : null}
            {order.customer.delivery_notes ? (
              <Text style={styles.notes}>
                {ft('foodCourierNotes')}: {order.customer.delivery_notes}
              </Text>
            ) : null}
          </>
        ) : order.dropoff_area ? (
          <>
            <Text style={styles.section}>{ft('foodCourierDropoffArea')}</Text>
            <Text style={styles.body}>{order.dropoff_area}</Text>
          </>
        ) : null}

        <View style={styles.actions}>
          {assigned ? (
            actions.map((action) => (
              <Pressable
                key={action}
                disabled={busy}
                onPress={() => startAction(order, action)}
                style={[
                  styles.actionButton,
                  action === 'fail' || action === 'release' ? styles.secondaryButton : styles.primaryButton,
                ]}
              >
                <Text style={action === 'fail' || action === 'release' ? styles.secondaryText : styles.primaryText}>
                  {ft(courierActionLabelKey(action))}
                </Text>
              </Pressable>
            ))
          ) : (
            <Pressable
              disabled={busy || active.length > 0}
              onPress={() => void perform(order, () => acceptFoodCourierOrder(order.id))}
              style={[styles.actionButton, styles.primaryButton, (busy || active.length > 0) && styles.disabled]}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{ft('foodCourierAccept')}</Text>}
            </Pressable>
          )}
          {busy && assigned ? <ActivityIndicator color="#2563eb" style={styles.spinner} /> : null}
        </View>
      </View>
    );
  };

  const pendingIsDeliver = pending?.action === 'deliver';

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{ft('foodCourierTitle')}</Text>
        <Pressable onPress={() => void loadOrders()} disabled={loading}>
          <Text style={styles.link}>{ft('foodRefresh')}</Text>
        </Pressable>
      </View>

      <View style={styles.earningsCard}>
        <Text style={styles.sectionLabel}>{ft('foodCourierEarnings')}</Text>
        {earnings ? (
          <View style={styles.earningsRow}>
            <EarningStat label={ft('foodEarnToday')} value={earnings.today} />
            <EarningStat label={ft('foodEarnWeek')} value={earnings.week} />
            <EarningStat label={ft('foodEarnAll')} value={earnings.all_time} />
            <EarningStat label={ft('foodEarnDeliveries')} value={String(earnings.deliveries)} />
          </View>
        ) : earningsError ? (
          <Pressable onPress={() => void loadEarnings()}>
            <Text style={styles.error}>
              {ft('foodEarnLoadFailed')} · {ft('foodRetry')}
            </Text>
          </Pressable>
        ) : (
          <ActivityIndicator color="#2563eb" />
        )}
      </View>

      {actionError && !pending ? <Text style={styles.error}>{actionError}</Text> : null}

      {loading ? (
        <ActivityIndicator size="small" color="#2563eb" style={styles.spinner} />
      ) : loadError ? (
        <View style={styles.card}>
          <Text style={styles.error}>{loadError}</Text>
          <Pressable onPress={() => void loadOrders()} style={[styles.actionButton, styles.primaryButton]}>
            <Text style={styles.primaryText}>{ft('foodRetry')}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>{ft('foodCourierActive')}</Text>
          {active.length === 0 ? (
            <Text style={styles.empty}>{ft('foodCourierNoActive')}</Text>
          ) : (
            active.map((order) => renderOrder(order, true))
          )}

          <Text style={styles.sectionLabel}>{ft('foodCourierAvailable')}</Text>
          {!online ? (
            <Text style={styles.empty}>{ft('foodCourierGoOnline')}</Text>
          ) : available.length === 0 ? (
            <Text style={styles.empty}>{ft('foodCourierNoAvailable')}</Text>
          ) : (
            available.map((order) => renderOrder(order, false))
          )}
        </>
      )}

      {pending ? (
        <FoodPromptModal
          visible
          title={ft(courierActionLabelKey(pending.action))}
          message={pending.action === 'release' ? ft('foodCourierReleaseConfirm') : undefined}
          inputKind={pendingIsDeliver ? 'pin' : pending.action === 'fail' ? 'text' : null}
          inputLabel={pendingIsDeliver ? ft('foodPinLabel') : pending.action === 'fail' ? ft('foodCourierFailReason') : undefined}
          hint={pendingIsDeliver ? ft('foodPinHint') : undefined}
          confirmLabel={ft('foodConfirm')}
          cancelLabel={ft('foodCancel')}
          destructive={pending.action === 'fail' || pending.action === 'release'}
          busy={busyId === pending.order.id}
          serverError={actionError}
          validate={(value) => {
            if (pendingIsDeliver) return isValidPin(value) ? null : ft('foodPinInvalid');
            if (pending.action === 'fail') return cleanReason(value) ? null : ft('foodReasonRequired');
            return null;
          }}
          onConfirm={confirmPending}
          onCancel={closePrompt}
        >
          {pendingIsDeliver ? (
            <View style={styles.proof}>
              {proofPhoto ? (
                <View style={styles.proofRow}>
                  <Image source={{ uri: proofPhoto.uri }} style={styles.proofImage} />
                  <View style={styles.flex}>
                    <Text style={styles.body}>{ft('foodCourierProofAdded')}</Text>
                    <Pressable onPress={() => setProofPhoto(null)}>
                      <Text style={styles.link}>{ft('foodCourierRemovePhoto')}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable onPress={() => void takeProofPhoto()}>
                  <Text style={styles.link}>{ft('foodCourierProof')}</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </FoodPromptModal>
      ) : null}
    </View>
  );
}

function EarningStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.earningStat}>
      <Text style={styles.earningValue}>{value}</Text>
      <Text style={styles.earningLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  link: { color: '#2563eb', fontWeight: '700' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginTop: 10, marginBottom: 6 },
  earningsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  earningStat: { flex: 1, alignItems: 'center' },
  earningValue: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  earningLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '800', color: '#0f172a', fontSize: 15 },
  status: { fontSize: 12, fontWeight: '700', color: '#1d4ed8' },
  earning: { marginTop: 4, color: '#15803d', fontWeight: '700' },
  cash: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', fontWeight: '700', fontSize: 13 },
  cashCollect: { backgroundColor: '#fef3c7', color: '#92400e' },
  cashPaid: { backgroundColor: '#dcfce7', color: '#166534' },
  section: { marginTop: 10, fontSize: 12, fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  body: { color: '#334155', fontSize: 14, marginTop: 2 },
  notes: { color: '#b45309', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  callButton: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  callText: { color: '#1d4ed8', fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 10 },
  actionButton: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginTop: 6, minWidth: 90, alignItems: 'center' },
  primaryButton: { backgroundColor: '#2563eb' },
  secondaryButton: { backgroundColor: '#fee2e2' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  secondaryText: { color: '#b91c1c', fontWeight: '700', fontSize: 13 },
  disabled: { opacity: 0.5 },
  spinner: { marginTop: 8 },
  empty: { color: '#94a3b8', fontStyle: 'italic' },
  error: { color: '#b91c1c', marginVertical: 6 },
  proof: { marginTop: 12 },
  proofRow: { flexDirection: 'row', alignItems: 'center' },
  proofImage: { width: 56, height: 56, borderRadius: 8, marginRight: 10 },
  flex: { flex: 1 },
});
