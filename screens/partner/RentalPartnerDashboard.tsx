import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { apiFetch, parseApiResponse } from '../../utils/apiClient';
import { getPartnerAuthHeaders } from '../../services/servicesPartnerApi';

type Vehicle = { id: number; make: string; model: string; daily_price: string; currency: string };
type Booking = { id: number; booking_number?: string; status?: string };

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results?: T[] }).results;
    return Array.isArray(results) ? results : [];
  }
  return [];
}

export default function RentalPartnerDashboard() {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [countryId, setCountryId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const headers = await getPartnerAuthHeaders();
      const [v, b] = await Promise.all([
        parseApiResponse(await apiFetch('/api/rentals/me/vehicles/', { headers })),
        parseApiResponse(await apiFetch('/api/rentals/me/vehicles/bookings/', { headers })),
      ]);
      setVehicles(unwrap<Vehicle>(v));
      setBookings(unwrap<Booking>(b));
    } catch {
      Alert.alert(t('error'), t('unableToLoadData', 'Unable to load data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onAdd = async () => {
    try {
      const headers = await getPartnerAuthHeaders();
      await parseApiResponse(
        await apiFetch('/api/rentals/me/vehicles/', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            make,
            model,
            year: 2020,
            plate_number: plate,
            country: Number(countryId),
            daily_price: '400.00',
            deposit_amount: '0',
          }),
        }),
      );
      setMake('');
      setModel('');
      setPlate('');
      await load();
    } catch {
      Alert.alert(t('error'), t('saveFailed', 'Could not save vehicle. Country id is required.'));
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>{t('carRental', 'Car Rental')}</Text>
      <TextInput placeholder="Make" value={make} onChangeText={setMake} style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 12 }} />
      <TextInput placeholder="Model" value={model} onChangeText={setModel} style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 }} />
      <TextInput placeholder="Plate" value={plate} onChangeText={setPlate} style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 }} />
      <TextInput placeholder="Country ID" value={countryId} onChangeText={setCountryId} style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 }} />
      <TouchableOpacity onPress={onAdd} style={{ marginTop: 12, backgroundColor: '#0f766e', padding: 12, borderRadius: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>{t('add', 'Add')}</Text>
      </TouchableOpacity>
      {vehicles.map((vehicle) => (
        <View key={vehicle.id} style={{ marginTop: 12, backgroundColor: '#fff', padding: 14, borderRadius: 12 }}>
          <Text style={{ fontWeight: '700' }}>
            {vehicle.make} {vehicle.model}
          </Text>
          <Text>
            {vehicle.daily_price} {vehicle.currency}/day
          </Text>
        </View>
      ))}
      <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 24 }}>{t('bookings', 'Bookings')}</Text>
      {bookings.map((booking) => (
        <View key={booking.id} style={{ marginTop: 8, backgroundColor: '#fff', padding: 12, borderRadius: 12 }}>
          <Text>
            {booking.booking_number || booking.id} · {booking.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
