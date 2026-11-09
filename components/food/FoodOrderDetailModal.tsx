import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchFoodPartnerOrder, postFoodPartnerOrderAction } from '../../features/food/api/foodPartnerApi';
import type { FoodPartnerActionPayload } from '../../features/food/api/foodPartnerApi';
import type { FoodOrderDetail, FoodPartnerAction } from '../../features/food/api/foodTypes';
import {
  actionInput,
  actionLabelKey,
  cleanReason,
  defaultPrepMinutesText,
  extractApiErrorDetail,
  formatFoodMoney,
  isDestructiveAction,
  isValidPin,
  partnerActionsFrom,
  statusLabelKey,
  validatePrepMinutes,
} from '../../features/food/foodHelpers';
import { useFoodTranslation } from '../../hooks/useFoodTranslation';
import FoodPromptModal from './FoodPromptModal';

type Props = {
  orderId: number | null;
  defaultPrepMinutes?: number | null;
  onClose: () => void;
  onChanged: () => void;
};

export default function FoodOrderDetailModal({ orderId, defaultPrepMinutes, onClose, onChanged }: Props) {
  const { ft } = useFoodTranslation();
  const [order, setOrder] = useState<FoodOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<FoodPartnerAction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (orderId == null) return;
    setLoading(true);
    setLoadError(null);
    try {
      setOrder(await fetchFoodPartnerOrder(orderId));
    } catch (error) {
      setLoadError(extractApiErrorDetail(error, ft('foodDetailLoadFailed')));
    } finally {
      setLoading(false);
    }
  }, [orderId, ft]);

  useEffect(() => {
    setOrder(null);
    setPendingAction(null);
    setActionError(null);
    void load();
  }, [load]);

  const submit = async (action: FoodPartnerAction, value: string) => {
    if (!order) return;
    const payload: FoodPartnerActionPayload = { action };
    const input = actionInput(action);
    if (input === 'prep_minutes') {
      const parsed = validatePrepMinutes(value);
      if (parsed.ok && parsed.value !== undefined) payload.prep_minutes = parsed.value;
    } else if (input === 'reason') {
      payload.reason = cleanReason(value) ?? '';
    } else if (input === 'pin') {
      payload.pin = value.trim();
    }
    setSubmitting(true);
    setActionError(null);
    try {
      const updated = await postFoodPartnerOrderAction(order.id, payload);
      setOrder(updated);
      setPendingAction(null);
      onChanged();
    } catch (error) {
      setActionError(extractApiErrorDetail(error, ft('foodActionFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const validateFor = (action: FoodPartnerAction) => (value: string): string | null => {
    const input = actionInput(action);
    if (input === 'prep_minutes') return validatePrepMinutes(value).ok ? null : ft('foodPrepMinutesInvalid');
    if (input === 'reason') return cleanReason(value) ? null : ft('foodReasonRequired');
    if (input === 'pin') return isValidPin(value) ? null : ft('foodPinInvalid');
    return null;
  };

  const actions = partnerActionsFrom(order?.actions);
  const currency = order?.currency;
  const statusKey = statusLabelKey(order?.status);
  const promptInput = pendingAction ? actionInput(pendingAction) : null;

  return (
    <Modal visible={orderId != null} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {order ? `${ft('foodOrderDetail')} · ${order.number}` : ft('foodOrderDetail')}
          </Text>
          <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button">
            <Text style={styles.closeText}>{ft('foodClose')}</Text>
          </Pressable>
        </View>

        {loading && !order ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0171CE" />
          </View>
        ) : loadError && !order ? (
          <View style={styles.center}>
            <Text style={styles.error}>{loadError}</Text>
            <Pressable onPress={() => void load()} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{ft('foodRetry')}</Text>
            </Pressable>
          </View>
        ) : order ? (
          <ScrollView contentContainerStyle={styles.body}>
            <View style={styles.badgeRow}>
              <Text style={styles.statusBadge}>{statusKey ? ft(statusKey) : order.status_label ?? order.status}</Text>
              <Text style={styles.typeBadge}>
                {order.fulfilment_type === 'pickup' ? ft('foodPickup') : ft('foodDelivery')}
              </Text>
            </View>
            <Text style={styles.meta}>
              {ft('foodCustomer')}: {order.customer_name}
            </Text>
            {order.prep_estimate_minutes ? (
              <Text style={styles.meta}>{ft('foodPrepEstimate', { minutes: order.prep_estimate_minutes })}</Text>
            ) : null}
            {order.payment_method ? (
              <Text style={styles.meta}>
                {ft('foodPayment')}: {order.payment_method}
                {order.payment_status ? ` · ${order.payment_status}` : ''}
              </Text>
            ) : null}

            <Text style={styles.sectionTitle}>{ft('foodLines')}</Text>
            {order.lines.map((line) => (
              <View key={line.id} style={styles.line}>
                <View style={styles.lineRow}>
                  <Text style={styles.lineName}>
                    {line.quantity} × {line.name}
                  </Text>
                  <Text style={styles.lineAmount}>{formatFoodMoney(line.subtotal, currency)}</Text>
                </View>
                {line.addons.map((addon, index) => (
                  <Text key={`${line.id}-addon-${index}`} style={styles.addon}>
                    + {addon.name} ({formatFoodMoney(addon.price, currency)})
                  </Text>
                ))}
                {line.special_instructions ? (
                  <Text style={styles.instructions}>{ft('foodInstructions', { text: line.special_instructions })}</Text>
                ) : null}
              </View>
            ))}

            <View style={styles.totals}>
              {order.subtotal ? (
                <TotalRow label={ft('foodSubtotal')} value={formatFoodMoney(order.subtotal, currency)} />
              ) : null}
              {order.delivery_fee && Number(order.delivery_fee) > 0 ? (
                <TotalRow label={ft('foodDeliveryFee')} value={formatFoodMoney(order.delivery_fee, currency)} />
              ) : null}
              {order.discount_amount && Number(order.discount_amount) > 0 ? (
                <TotalRow label={ft('foodDiscount')} value={`- ${formatFoodMoney(order.discount_amount, currency)}`} />
              ) : null}
              <TotalRow label={ft('foodTotal')} value={formatFoodMoney(order.total, currency)} bold />
            </View>

            {order.delivery_notes ? (
              <>
                <Text style={styles.sectionTitle}>{ft('foodDeliveryNotes')}</Text>
                <Text style={styles.meta}>{order.delivery_notes}</Text>
              </>
            ) : null}

            {order.fulfilment_type !== 'pickup' ? (
              <>
                <Text style={styles.sectionTitle}>{ft('foodCourier')}</Text>
                <Text style={styles.meta}>
                  {order.courier
                    ? `${order.courier.name}${order.courier.vehicle ? ` · ${order.courier.vehicle}` : ''}`
                    : ft('foodNoCourier')}
                </Text>
              </>
            ) : null}

            {order.cancellation_reason ? (
              <>
                <Text style={styles.sectionTitle}>{ft('foodCancellationReason')}</Text>
                <Text style={styles.meta}>{order.cancellation_reason}</Text>
              </>
            ) : null}

            {order.settlement ? (
              <>
                <Text style={styles.sectionTitle}>{ft('foodSettlement')}</Text>
                <TotalRow label={ft('foodSettlementGross')} value={formatFoodMoney(order.settlement.gross, currency)} />
                <TotalRow label={ft('foodPlatformFee')} value={formatFoodMoney(order.settlement.platform_fee, currency)} />
                <TotalRow label={ft('foodSettlementNet')} value={formatFoodMoney(order.settlement.net, currency)} bold />
                <Text style={styles.meta}>
                  {order.settlement.paid_out ? ft('foodSettlementPaid') : ft('foodSettlementUnpaid')}
                </Text>
              </>
            ) : null}

            {order.timeline.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{ft('foodTimeline')}</Text>
                {order.timeline.map((event, index) => {
                  const key = statusLabelKey(event.status);
                  return (
                    <Text key={`${event.status}-${index}`} style={styles.timeline}>
                      {new Date(event.at).toLocaleString()} · {event.label || (key ? ft(key) : event.status)}
                    </Text>
                  );
                })}
              </>
            ) : null}

            {actionError && !pendingAction ? <Text style={styles.error}>{actionError}</Text> : null}
            <View style={styles.actions}>
              {actions.length === 0 ? (
                <Text style={styles.muted}>{ft('foodNoActions')}</Text>
              ) : (
                actions.map((action) => (
                  <Pressable
                    key={action}
                    disabled={submitting}
                    onPress={() => {
                      setActionError(null);
                      setPendingAction(action);
                    }}
                    style={[styles.actionButton, isDestructiveAction(action) ? styles.danger : styles.primary]}
                  >
                    <Text style={styles.primaryButtonText}>{ft(actionLabelKey(action))}</Text>
                  </Pressable>
                ))
              )}
            </View>
          </ScrollView>
        ) : null}
      </View>

      {pendingAction && order ? (
        <FoodPromptModal
          visible
          title={ft(actionLabelKey(pendingAction))}
          message={
            promptInput === null
              ? ft('foodConfirmAction', { action: ft(actionLabelKey(pendingAction)), number: order.number })
              : undefined
          }
          inputKind={promptInput === 'prep_minutes' ? 'number' : promptInput === 'reason' ? 'text' : promptInput === 'pin' ? 'pin' : null}
          inputLabel={
            promptInput === 'prep_minutes'
              ? ft('foodPrepMinutesLabel')
              : promptInput === 'reason'
                ? ft('foodRejectReasonLabel')
                : promptInput === 'pin'
                  ? ft('foodPinLabel')
                  : undefined
          }
          hint={promptInput === 'pin' ? ft('foodPinHint') : undefined}
          initialValue={promptInput === 'prep_minutes' ? defaultPrepMinutesText(defaultPrepMinutes) : ''}
          confirmLabel={ft('foodConfirm')}
          cancelLabel={ft('foodCancel')}
          destructive={isDestructiveAction(pendingAction)}
          busy={submitting}
          serverError={actionError}
          validate={validateFor(pendingAction)}
          onConfirm={(value) => void submit(pendingAction, value)}
          onCancel={() => {
            setPendingAction(null);
            setActionError(null);
          }}
        />
      ) : null}
    </Modal>
  );
}

function TotalRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.totalValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#0171CE',
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '800' },
  closeButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  closeText: { color: '#fff', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  body: { padding: 16, paddingBottom: 40 },
  badgeRow: { flexDirection: 'row', marginBottom: 8 },
  statusBadge: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
    overflow: 'hidden',
  },
  typeBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  meta: { fontSize: 14, color: '#334155', marginTop: 4 },
  muted: { fontSize: 13, color: '#64748b', fontStyle: 'italic' },
  sectionTitle: { marginTop: 18, marginBottom: 6, fontSize: 13, fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  line: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between' },
  lineName: { flex: 1, fontWeight: '700', color: '#0f172a' },
  lineAmount: { fontWeight: '700', color: '#0f172a', marginLeft: 8 },
  addon: { marginTop: 2, color: '#475569', fontSize: 13 },
  instructions: { marginTop: 4, color: '#b45309', fontSize: 13, fontStyle: 'italic' },
  totals: { marginTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  totalLabel: { color: '#475569' },
  totalValue: { color: '#0f172a' },
  bold: { fontWeight: '800', color: '#0f172a' },
  timeline: { fontSize: 13, color: '#334155', marginTop: 3 },
  error: { color: '#b91c1c', marginTop: 12, textAlign: 'center' },
  actions: { marginTop: 20 },
  actionButton: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  primary: { backgroundColor: '#0171CE' },
  danger: { backgroundColor: '#dc2626' },
  primaryButton: { marginTop: 12, backgroundColor: '#0171CE', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});
