import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import tw from 'twrnc';
import { baseAPI } from '../services/types';
import { selectUser } from '../redux/slices/authSlice';

interface RideTask {
  id: number;
  ride_number: string;
  pickup_address: string;
  destination_address: string;
  estimated_price: number | string;
  currency: string;
  status: string;
}

export default function DriverTasksScreen() {
  const user = useSelector(selectUser) as { access_token?: string; token?: string } | null;
  const token = user?.access_token ?? user?.token;
  const [rides, setRides] = useState<RideTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${baseAPI}/api/rides/driver/available/`, { headers });
      const data = await res.json();
      setRides(Array.isArray(data) ? data : []);
    } catch {
      setRides([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const acceptRide = async (rideId: number) => {
    if (!token) {
      Alert.alert('Login', 'Driver token required');
      return;
    }
    try {
      const res = await fetch(`${baseAPI}/api/rides/${rideId}/accept/`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        Alert.alert('Accepted', 'Ride accepted — navigate to pickup');
        load();
      } else {
        Alert.alert('Error', 'Could not accept ride');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    }
  };

  return (
    <View style={tw`flex-1 bg-slate-50 p-4`}>
      <Text style={tw`text-xl font-bold text-slate-900 mb-4`}>Available Rides</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<Text style={tw`text-slate-500 text-center mt-10`}>No ride requests nearby</Text>}
          renderItem={({ item }) => (
            <View style={tw`bg-white rounded-2xl p-4 mb-3 border border-slate-100`}>
              <Text style={tw`font-bold`}>{item.ride_number}</Text>
              <Text style={tw`text-sm text-slate-600 mt-1`}>{item.pickup_address}</Text>
              <Text style={tw`text-sm text-slate-600`}>→ {item.destination_address}</Text>
              <Text style={tw`text-blue-700 font-bold mt-2`}>
                {item.currency} {item.estimated_price}
              </Text>
              <TouchableOpacity
                style={tw`mt-3 bg-blue-600 rounded-xl py-3 items-center`}
                onPress={() => acceptRide(item.id)}
              >
                <Text style={tw`text-white font-bold`}>Accept Ride</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
