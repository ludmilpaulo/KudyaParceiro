import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import tailwind from 'twrnc';
import { selectUser } from '../redux/slices/authSlice';
import { baseAPI } from '../services/types';

interface Customer {
  id: number;
  username: string;
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
      <ScrollView style={tailwind`px-4`}>
        <View style={tailwind`mt-4`}>
          <View style={tailwind`flex flex-row border-b border-blue-gray-100 bg-blue-gray-50 py-4`}>
            <Text style={tailwind`w-1/3 font-normal text-gray-700`}>Name</Text>
            <Text style={tailwind`w-1/3 font-normal text-gray-700`}>Phone</Text>
            <Text style={tailwind`w-1/3 font-normal text-gray-700`}>Address</Text>
          </View>
          {customers.map((customer) => (
            <View key={customer.id} style={tailwind`flex flex-row items-center border-b border-blue-gray-50 py-4`}>
              <View style={tailwind`w-1/3 flex flex-row items-center`}>
                <Image
                  source={{ uri: `${baseAPI}${customer.avatar}` }}
                  style={tailwind`w-10 h-10 rounded-full bg-gray-200`}
                />
                <Text style={tailwind`ml-3`}>{customer.username}</Text>
              </View>
              <Text style={tailwind`w-1/3`}>{customer.phone}</Text>
              <Text style={tailwind`w-1/3`}>{customer.address}</Text>
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
});

export default CustomersList;
