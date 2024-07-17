// screens/RestaurantDashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { selectUser } from '../redux/slices/authSlice';
import { fetchFornecedorData, updateLocation } from '../services/apiService';
import { FornecedorType } from '../services/types';
import tailwind from 'twrnc'; // Correct import for tailwind
import Screen from '../components/Screen';
import { LinearGradient } from 'expo-linear-gradient';

const RestaurantDashboard: React.FC = () => {
  const user = useSelector(selectUser);
  const [fornecedor, setFornecedor] = useState<FornecedorType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.user_id) {
        try {
          setLoading(true);
          const data = await fetchFornecedorData(user.user_id);
          setFornecedor(data);
        } catch (error) {
          setError('Ocorreu um erro ao buscar os dados');
          console.error('Fetch Fornecedor Data Error:', error); // Debugging statement
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const updateLocationWithRetry = async (userId: number, location: string, retries: number = 3) => {
    try {
      const response = await updateLocation(userId, location);
      console.log('Location update response:', response);
    } catch (error) {
      console.error('Error updating location:', error);
      if (retries > 0) {
        setTimeout(() => {
          updateLocationWithRetry(userId, location, retries - 1);
        }, 1000);
      } else {
        console.error('Failed to update location after multiple attempts');
      }
    }
  };

  useEffect(() => {
    const updateLocationPeriodically = async () => {
      if (user?.user_id) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const loc = `${latitude},${longitude}`;
        console.log('Updating location to:', loc);
        await updateLocationWithRetry(user.user_id, loc);
      }
    };

    const intervalId = setInterval(updateLocationPeriodically, 5000); // Update every 5 seconds for testing
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <LinearGradient colors={['#FCB61A', '#0171CE']} style={styles.container}>
      <Screen>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}
        {error && <Text style={tailwind`text-red-500`}>{error}</Text>}
        {!loading && !error && fornecedor && (
          <View style={tailwind`p-4`}>
            <Text style={tailwind`text-2xl font-bold text-white`}>Bem-vindo, {fornecedor.name}!</Text>
            {/* Add additional content here */}
          </View>
        )}
      </Screen>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RestaurantDashboard;
