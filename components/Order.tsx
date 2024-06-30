import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import tailwind  from 'twrnc';
import { selectUser } from '../redux/slices/authSlice';
import { baseAPI, OrderTypes } from '../services/types';
import { fetchOrders, updateOrderStatus } from '../services/apiService';


const Order: React.FC = () => {
  const [orders, setOrders] = useState<OrderTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector(selectUser);
  

  const fetchOrderData = useCallback(async () => {
    setLoading(true);
    if (user?.user_id) {
      try {
        const data = await fetchOrders(user.user_id);
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
              console.log("sending");
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
    fetchOrderData();

    const eventSource = new EventSource(`${baseAPI}/restaurant/sse?user_id=${user?.user_id}`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrders(data);
    };

    return () => eventSource.close();
  }, [fetchOrderData, user?.user_id]);

  return (
    <View style={tailwind`container mx-auto px-4`}>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView>
          <View style={tailwind`flex flex-row justify-between p-4 border-b bg-gray-200`}>
            <Text style={tailwind`text-base font-bold`}>No</Text>
            <Text style={tailwind`text-base font-bold`}>Detalhes do Pedido</Text>
            <Text style={tailwind`text-base font-bold`}>Cliente</Text>
            <Text style={tailwind`text-base font-bold`}>Motorista</Text>
            <Text style={tailwind`text-base font-bold`}>Total</Text>
            <Text style={tailwind`text-base font-bold`}>Status</Text>
            <Text style={tailwind`text-base font-bold`}>Ação</Text>
          </View>
          {orders.map((order, index) => (
            <View key={index} style={tailwind`flex flex-row justify-between p-4 border-b`}>
              <Text style={tailwind`text-base`}>{order.id}</Text>
              <View>
                {order.order_details.map((od, index) => (
                  <Text key={od.id} style={tailwind`text-base`}>
                    {od.meal.name} {od.meal.price} x {od.quantity} = {od.sub_total}kz
                    {index < order.order_details.length - 1 && '\n'}
                  </Text>
                ))}
              </View>
              <Text style={tailwind`text-base`}>{order.customer.name}</Text>
              <Text style={tailwind`text-base`}>{order.driver}</Text>
              <Text style={tailwind`text-base`}>{order.total}</Text>
              <Text style={tailwind`text-base`}>{order.status}</Text>
              {order.status === 'Cozinhando' && (
                <TouchableOpacity
                  onPress={() => handleStatus(order.id)}
                  style={tailwind`px-4 py-2 ml-4 bg-blue-500 rounded`}
                >
                  <Text style={tailwind`text-white`}>Chamar Motorista</Text>
                </TouchableOpacity>
              )}
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
});

export default Order;
