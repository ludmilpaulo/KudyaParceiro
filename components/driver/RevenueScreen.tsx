import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { baseAPI } from '../../services/types';


interface Revenue {
  [key: string]: number;
}

const RevenueScreen = () => {
  const user = useSelector(selectUser);
  const [revenue, setRevenue] = useState<Revenue>({});

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await axios.post(`${baseAPI}/driver/revenue/`, { access_token: user.token });
        setRevenue(response.data.revenue);
      } catch (error) {
        console.error('Error fetching revenue data', error);
      }
    };

    fetchRevenue();
  }, [user.token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receitas</Text>
      {Object.entries(revenue).map(([day, amount]) => (
        <View key={day} style={styles.revenueItem}>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.amount}>{amount}KZ</Text>
        </View>
      ))}
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
  revenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  day: {
    fontSize: 16,
  },
  amount: {
    fontSize: 16,
  },
});

export default RevenueScreen;
