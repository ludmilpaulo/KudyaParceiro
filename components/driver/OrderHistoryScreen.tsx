import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { baseAPI } from '../../services/types';

interface Order {
  id: number;
  total: number;
  picked_at: string;
}

const OrderHistoryScreen = () => {
  const user = useSelector(selectUser);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.post(`${baseAPI}/driver/order/history/`, { access_token: user.token });
        setOrderHistory(response.data.order_history);
      } catch (error) {
        console.error('Error fetching order history', error);
      }
    };

    fetchOrderHistory();
  }, [user.token]);

  const renderItem: ListRenderItem<Order> = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderText}>ID: {item.id}</Text>
      <Text style={styles.orderText}>Total: {item.total} kz</Text>
      <Text style={styles.orderText}>Data: {item.picked_at}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Pedidos</Text>
      <FlatList
        data={orderHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  orderText: {
    fontSize: 16,
  },
});

export default OrderHistoryScreen;
