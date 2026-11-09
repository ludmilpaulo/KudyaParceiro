import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Linking, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import tailwind from 'twrnc';
import { selectUser } from '../../redux/slices/authSlice';
import { OrderTypes } from '../../services/types';
import { fetchOrders, updateOrderStatus } from '../../services/apiService';
import { scheduleLocalNotification } from '../../utils/localNotifications';
import * as Haptics from 'expo-haptics';
import FoodOrdersBoard from '../food/FoodOrdersBoard';
import { useFoodPartnerMe } from '../../features/food/useFoodPartnerMe';
import { useFoodTranslation } from '../../hooks/useFoodTranslation';

const ORDER_POLL_MS = 10000;
const STATUS_PROCESSING = 1;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const confirmAction = (message: string, onConfirm: () => void) => {
  // Alert.alert is a no-op on react-native-web.
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert('Confirmar', message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'OK', onPress: onConfirm },
  ]);
};

const LegacyOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const user = useSelector(selectUser);
  const userId = user?.user_id;
  const knownOrderIds = useRef<Set<number> | null>(null);

  const loadOrders = useCallback(async (notifyNew: boolean) => {
    if (!userId) return;
    try {
      const data = await fetchOrders(userId);
      const list = Array.isArray(data) ? data : [];
      const previous = knownOrderIds.current;
      const newProcessing = previous
        ? list.filter((order) => !previous.has(order.id) && order.status_code === STATUS_PROCESSING)
        : [];
      knownOrderIds.current = new Set(list.map((order) => order.id));
      setOrders(list);
      setLoadError(null);
      if (notifyNew && newProcessing.length > 0) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        void scheduleLocalNotification({
          title: 'Novo Pedido',
          body: newProcessing.length === 1
            ? `Pedido #${newProcessing[0].id} recebido.`
            : `${newProcessing.length} novos pedidos recebidos.`,
          sound: true,
        });
      }
    } catch (error) {
      setLoadError(errorMessage(error, 'Não foi possível carregar os pedidos.'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    knownOrderIds.current = null;
    setLoading(true);
    void loadOrders(false);
    const timer = setInterval(() => {
      void loadOrders(true);
    }, ORDER_POLL_MS);
    return () => clearInterval(timer);
  }, [userId, loadOrders]);

  const handleStatus = (orderId: number, nextStatus: number, label: string) => {
    if (!userId) return;
    confirmAction(label, async () => {
      setActionError(null);
      setUpdatingId(orderId);
      try {
        await updateOrderStatus(userId, orderId, nextStatus);
        await loadOrders(false);
      } catch (error) {
        setActionError(errorMessage(error, 'Falha ao atualizar o status do pedido. Por favor, tente novamente.'));
      } finally {
        setUpdatingId(null);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={tailwind`flex-1 bg-white`}>
      {loadError ? (
        <View style={tailwind`items-center p-4`}>
          <Text style={tailwind`text-red-600 mb-2 text-center`}>{loadError}</Text>
          <TouchableOpacity onPress={() => void loadOrders(false)} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {actionError ? <Text style={tailwind`text-red-600 text-center p-2`}>{actionError}</Text> : null}
      {!loadError && orders.length === 0 ? (
        <Text style={tailwind`text-center text-gray-500 p-6`}>Ainda não há pedidos.</Text>
      ) : (
        <ScrollView>
          {orders.map((order) => (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Pedido No: {order.id}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Detalhes:</Text>{' '}
                  {(order.order_details ?? []).map((od, index) => (
                    <Text key={index}>
                      {od.meal?.name} {od.meal?.price} x {od.quantity} = {od.sub_total}kz
                      {index < order.order_details.length - 1 && '\n'}
                    </Text>
                  ))}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Cliente:</Text> {order.customer?.name ?? '—'}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Motorista:</Text> {order.driver?.name ?? '—'}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Total:</Text> {order.total}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Preço Original:</Text> {order.original_price}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Status:</Text> {order.status}
                </Text>
                {order.payment_status_restaurant === 'paid' && order.proof_of_payment_restaurant ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(order.proof_of_payment_restaurant)}
                    style={styles.downloadButton}
                  >
                    <Text style={styles.downloadButtonText}>Baixar Comprovante de Pagamento</Text>
                  </TouchableOpacity>
                ) : null}
                {order.status_code === STATUS_PROCESSING && (
                  <View>
                    <TouchableOpacity
                      disabled={updatingId === order.id}
                      onPress={() => handleStatus(order.id, 2, 'Marcar como pronto e chamar o motorista?')}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>
                        {updatingId === order.id ? 'A atualizar...' : 'Pronto / Chamar motorista'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={updatingId === order.id}
                      onPress={() => handleStatus(order.id, 5, 'Rejeitar este pedido?')}
                      style={[styles.actionButton, { backgroundColor: '#dc2626', marginTop: 8 }]}
                    >
                      <Text style={styles.actionButtonText}>Rejeitar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

/** Restaurants use the Food v1 board; shops without a restaurant workspace keep the legacy list. */
const Orders: React.FC = () => {
  const { me, loading, notMember, error, reload } = useFoodPartnerMe();
  const { ft } = useFoodTranslation();

  if (loading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  if (me) return <FoodOrdersBoard me={me} />;
  if (notMember) return <LegacyOrders />;
  return (
    <View style={tailwind`flex-1 items-center justify-center p-4 bg-white`}>
      <Text style={tailwind`text-red-600 mb-2 text-center`}>{error || ft('foodOrdersLoadFailed')}</Text>
      <TouchableOpacity onPress={reload} style={styles.actionButton}>
        <Text style={styles.actionButtonText}>{ft('foodRetry')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  cardContent: {
    marginTop: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  cardLabel: {
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  downloadButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Orders;
