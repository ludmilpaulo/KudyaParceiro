import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import {
  createPartnerService,
  fetchMyPartnerServices,
  fetchPartnerBookings,
  fetchServiceCategories,
  type PartnerBooking,
  type PartnerService,
} from '../../services/servicesPartnerApi';

export default function ServicesPartnerDashboard() {
  const { t } = useTranslation();
  const [services, setServices] = useState<PartnerService[]>([]);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [mine, book] = await Promise.all([fetchMyPartnerServices(), fetchPartnerBookings()]);
      setServices(mine);
      setBookings(book);
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
      const cats = await fetchServiceCategories();
      if (!cats[0]) {
        Alert.alert(t('error'), t('noCategories', 'No service categories available.'));
        return;
      }
      await createPartnerService({
        category: cats[0].id,
        title: 'New Service',
        description: 'New service',
        price: 1000,
        currency: 'AOA',
        duration_minutes: 90,
        delivery_type: 'in_person',
        is_active: true,
      });
      await load();
    } catch {
      Alert.alert(t('error'), t('saveFailed', 'Could not save'));
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>{t('myServices', 'My Services')}</Text>
      <TouchableOpacity onPress={onAdd} style={{ marginTop: 12, backgroundColor: '#0171CE', padding: 12, borderRadius: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>{t('add', 'Add')}</Text>
      </TouchableOpacity>
      {services.map((service) => (
        <View key={service.id} style={{ marginTop: 12, backgroundColor: '#fff', padding: 14, borderRadius: 12 }}>
          <Text style={{ fontWeight: '700' }}>{service.title}</Text>
          <Text>
            {service.price} {service.currency}
          </Text>
        </View>
      ))}
      <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 24 }}>{t('bookings', 'Bookings')}</Text>
      {bookings.map((booking) => (
        <View key={booking.id} style={{ marginTop: 8, backgroundColor: '#fff', padding: 12, borderRadius: 12 }}>
          <Text>{booking.service_title || `#${booking.id}`}</Text>
          <Text>
            {booking.status} · {booking.booking_date}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
