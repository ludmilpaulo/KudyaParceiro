import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Vibration, Linking } from 'react-native';
import { useSelector } from 'react-redux';
import tailwind from 'twrnc';
import { selectUser } from '../../redux/slices/authSlice';
import { baseAPI, OrderTypes } from '../../services/types';
import { fetchOrders, updateOrderStatus } from '../../services/apiService';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector(selectUser);

  const fetchOrderData = useCallback(async () => {
    setLoading(true);
    if (user?.user_id) {
      try {
        const data = await fetchOrders(user.user_id);
        console.log("order response", data);
        setOrders(data);
      } catch (error) {
        console.error("Ocorreu um erro:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [user?.user_id]);

  const handleStatus = async (orderId: number) => {
    const user_id = user?.user_id;
    if (!user_id) {
      Alert.alert("Erro", "ID do usuário não fornecido.");
      return;
    }

    Alert.alert(
      "Confirmar",
      "Tem certeza de que deseja chamar o motorista?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              await updateOrderStatus(user_id, orderId);
              Alert.alert("Sucesso", "Motorista chamado com sucesso!");
              fetchOrderData(); // Opcionalmente, você pode atualizar os pedidos
            } catch (error) {
              console.error("Erro ao atualizar o status do pedido:", error);
              Alert.alert("Erro", "Falha ao atualizar o status do pedido. Por favor, tente novamente.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const fetchOrdersPeriodically = setInterval(async () => {
      try {
        const data = await fetchOrders(user?.user_id);
        if (JSON.stringify(data) !== JSON.stringify(orders)) {
          setOrders(data);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Novo Pedido",
              body: "Você tem novos pedidos.",
              sound: true,
            },
            trigger: null,
          });
        }
      } catch (error) {
        console.error("Ocorreu um erro:", error);
      }
    }, 3000);

    return () => clearInterval(fetchOrdersPeriodically);
  }, [orders, user?.user_id]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  return (
    <View style={tailwind`flex-1 bg-white`}>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView>
          {orders.map((order, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Pedido No: {order.id}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Detalhes:</Text>{' '}
                  {order.order_details.map((od, index) => (
                    <Text key={index}>
                      {od.meal.name} {od.meal.price} x {od.quantity} = {od.sub_total}kz
                      {index < order.order_details.length - 1 && '\n'}
                    </Text>
                  ))}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Cliente:</Text> {order.customer.name}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Motorista:</Text> {order?.driver?.name}
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
                {order.payment_status_restaurant === 'paid' && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(order.proof_of_payment_restaurant)}
                    style={styles.downloadButton}
                  >
                    <Text style={styles.downloadButtonText}>Baixar Comprovante de Pagamento</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'Cozinhando' && (
                  <TouchableOpacity
                    onPress={() => handleStatus(order.id)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionButtonText}>Chamar Motorista</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
