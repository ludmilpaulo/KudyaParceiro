import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { fetchPartnerReportDrivers } from '../../features/partner/api/partnerReportsApi';
import { baseAPI } from '../../services/types';

interface Driver {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  address: string;
}

const DriverList: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadError(false);
    try {
      const response = await fetchPartnerReportDrivers();
      setDrivers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setLoadError(true);
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
        <Text style={tailwind`text-2xl font-bold mb-4 text-center`}>Drivers List</Text>
        {loadError ? (
          <Text style={tailwind`text-center text-red-600 mb-4`}>Não foi possível carregar os motoristas.</Text>
        ) : drivers.length === 0 ? (
          <Text style={tailwind`text-center text-gray-500 mb-4`}>Ainda não há motoristas.</Text>
        ) : null}
        <View style={tailwind`flex flex-wrap justify-center`}>
          {drivers.map((driver) => (
            <View key={driver.id} style={styles.card}>
              <Image
                source={
                  driver.avatar
                    ? { uri: driver.avatar.startsWith('http') ? driver.avatar : `${baseAPI}${driver.avatar}` }
                    : undefined
                }
                style={styles.avatar}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.username}>{driver.name}</Text>
                <Text style={styles.phone}>{driver.phone}</Text>
                <Text style={styles.address}>{driver.address}</Text>
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
    backgroundColor: '#fff',
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

export default DriverList;
