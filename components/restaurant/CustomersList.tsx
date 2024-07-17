import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import tailwind from 'twrnc';
import { selectUser } from '../../redux/slices/authSlice';
import { baseAPI } from '../../services/types';

interface Customer {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  address: string;
}

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${baseAPI}/report/restaurant/customers/${user.user_id}/`,
      );
      console.log("customer",response.data)
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={tailwind`h-full w-full`}>
      <ScrollView style={tailwind`px-4 py-4`}>
        <Text style={tailwind`text-2xl font-bold mb-4 text-center`}>Customers List</Text>
        <View style={tailwind`flex flex-wrap justify-center`}>
          {customers.map((customer) => (
            <View key={customer.id} style={styles.card}>
              <Image
                source={{ uri: `${baseAPI}${customer.avatar}` }}
                style={styles.avatar}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.username}>{customer.name}</Text>
                <Text style={styles.phone}>{customer.phone}</Text>
                <Text style={styles.address}>{customer.address}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#e2e8f0',
  },
  infoContainer: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#555',
  },
});

export default CustomersList;
