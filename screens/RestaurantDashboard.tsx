import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { selectUser } from '../redux/slices/authSlice';
import { fetchFornecedorData, updateLocation } from '../services/apiService';
import { FornecedorType } from '../services/types';
import tailwind from 'twrnc'; // Correct import for tailwind
import Sidebar from '../components/Sidebar';
import Screen from '../components/Screen';

const RestaurantDashboard: React.FC = () => {
  const user = useSelector(selectUser);
  const [fornecedor, setFornecedor] = useState<FornecedorType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.user_id) {
        try {
          setLoading(true);
          const data = await fetchFornecedorData(user.user_id);
          setFornecedor(data);
        } catch (error) {
          setError('Ocorreu um erro ao buscar os dados');
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

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Screen>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      {error && <Text style={tailwind`text-red-500`}>{error}</Text>}
      {!loading && !error && (
        <>
          <View style={tailwind`justify-center items-center`}>
              <Button
                onPress={handleSidebarToggle}
                title="Menu"
                color="#12e27a"
                accessibilityLabel="Abrir Menu"
              />
          </View>
          <Sidebar fornecedor={fornecedor} isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
        </>
      )}
    </Screen>
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

export default RestaurantDashboard;
