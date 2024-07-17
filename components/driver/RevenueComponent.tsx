import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { baseAPI } from '../../services/types';

const RevenueComponent = () => {
  const user = useSelector(selectUser);
  const [revenue, setRevenue] = useState<any>({});

  useEffect(() => {
    axios.post(`${baseAPI}/revenue/`, { access_token: user.token })
      .then(response => setRevenue(response.data.revenue))
      .catch(error => console.error('Error fetching revenue:', error));
  }, [user.token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receita da Semana</Text>
      {Object.entries(revenue).map(([day, amount]: any) => (
        <View key={day} style={styles.revenueItem}>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.amount}>R$ {amount.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  revenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  day: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 16,
    color: '#007bff',
  },
});

export default RevenueComponent;
