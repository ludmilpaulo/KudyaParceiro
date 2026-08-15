import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { theme } from '../../configs/theme';
import {
  createPartnerService,
  fetchMyServices,
  fetchPartnerBookings,
  fetchServiceCategories,
  updateBookingAction,
  type PartnerBooking,
  type PartnerService,
  type ServiceCategory,
} from '../../services/categoryPartnerApi';
import { fetchPartnerEarnings } from '../../features/partner/api/partnerDashboardApi';

export default function ServicesPartnerDashboard() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<PartnerService[]>([]);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('100');
  const [duration, setDuration] = useState('60');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<{ available_balance: string; currency: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [cats, mine, rows, earning] = await Promise.all([
        fetchServiceCategories(),
        fetchMyServices(),
        fetchPartnerBookings(),
        fetchPartnerEarnings().catch(() => null),
      ]);
      setCategories(cats);
      setServices(mine);
      setBookings(rows);
      if (earning) setEarnings({ available_balance: earning.available_balance, currency: earning.currency });
      if (!categoryId && cats[0]) setCategoryId(cats[0].id);
    } catch {
      setError(t('loadFailed', 'Failed to load services.'));
    }
  }, [categoryId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!title.trim() || !categoryId) return;
    try {
      const created = await createPartnerService({
        category: categoryId,
        title: title.trim(),
        description: title.trim(),
        price: Number(price),
        currency: 'ZAR',
        duration_minutes: Number(duration) || 60,
        delivery_type: 'in_person',
        is_active: true,
      });
      setServices((current) => [created, ...current]);
      setTitle('');
    } catch {
      Alert.alert(t('error', 'Error'), t('saveFailed', 'Could not create service.'));
    }
  };

  const handleBooking = async (id: number, action: 'confirm' | 'start' | 'complete') => {
    try {
      await updateBookingAction(id, action);
      await load();
    } catch {
      Alert.alert(t('error', 'Error'), t('saveFailed', 'Could not update booking.'));
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('myServices', 'My Services')}</Text>
      {earnings ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('partnerEarnings', 'Earnings')}</Text>
          <Text style={styles.meta}>
            {earnings.currency} {earnings.available_balance}
          </Text>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={t('title', 'Title')} />
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder={t('price', 'Price')} />
      <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder={t('durationMinutes', 'Duration')} />
      <View style={styles.row}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setCategoryId(category.id)}
            style={[styles.chip, categoryId === category.id && styles.chipActive]}
          >
            <Text style={categoryId === category.id ? styles.chipActiveText : styles.chipText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={() => void handleCreate()}>
        <Text style={styles.buttonText}>{t('add', 'Add')}</Text>
      </TouchableOpacity>
      {services.map((service) => (
        <View key={service.id} style={styles.card}>
          <Text style={styles.cardTitle}>{service.title}</Text>
          <Text style={styles.meta}>{service.price} {service.currency} · {service.duration_minutes}m</Text>
        </View>
      ))}
      <Text style={styles.title}>{t('bookings', 'Bookings')}</Text>
      {bookings.map((booking) => (
        <View key={booking.id} style={styles.card}>
          <Text style={styles.cardTitle}>{booking.service_title || `#${booking.id}`}</Text>
          <Text style={styles.meta}>{booking.status} · {booking.booking_date} {booking.booking_time}</Text>
          <View style={styles.row}>
            {booking.status === 'pending' ? (
              <TouchableOpacity style={styles.smallButton} onPress={() => void handleBooking(booking.id, 'confirm')}>
                <Text style={styles.buttonText}>{t('confirm', 'Confirm')}</Text>
              </TouchableOpacity>
            ) : null}
            {booking.status === 'confirmed' ? (
              <TouchableOpacity style={styles.smallButton} onPress={() => void handleBooking(booking.id, 'start')}>
                <Text style={styles.buttonText}>{t('start', 'Start')}</Text>
              </TouchableOpacity>
            ) : null}
            {booking.status === 'in_progress' ? (
              <TouchableOpacity style={styles.smallButton} onPress={() => void handleBooking(booking.id, 'complete')}>
                <Text style={styles.buttonText}>{t('complete', 'Complete')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginBottom: 12, marginTop: 8 },
  error: { color: '#b91c1c', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12, marginBottom: 8, backgroundColor: theme.colors.surface, color: theme.colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text },
  chipActiveText: { color: '#fff', fontWeight: '700' },
  button: { backgroundColor: theme.colors.primary, borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 16 },
  smallButton: { backgroundColor: theme.colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: theme.colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  cardTitle: { fontWeight: '700', color: theme.colors.text },
  meta: { color: theme.colors.textSecondary, marginTop: 4 },
});
