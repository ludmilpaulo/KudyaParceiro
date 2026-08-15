import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { theme } from '../../configs/theme';
import {
  createRentalVehicle,
  fetchCountries,
  fetchMyRentalVehicles,
  fetchPartnerRentalBookings,
  updateRentalBookingStatus,
  type RentalBooking,
  type RentalVehicle,
} from '../../services/categoryPartnerApi';
import { fetchPartnerEarnings } from '../../features/partner/api/partnerDashboardApi';

export default function RentalPartnerDashboard() {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([]);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [countries, setCountries] = useState<Array<{ id: number; name: string }>>([]);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2020');
  const [plate, setPlate] = useState('');
  const [dailyPrice, setDailyPrice] = useState('400');
  const [countryId, setCountryId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<{ available_balance: string; currency: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [fleet, rows, countryRows, earning] = await Promise.all([
        fetchMyRentalVehicles(),
        fetchPartnerRentalBookings(),
        fetchCountries(),
        fetchPartnerEarnings().catch(() => null),
      ]);
      setVehicles(fleet);
      setBookings(rows);
      setCountries(countryRows);
      if (earning) setEarnings({ available_balance: earning.available_balance, currency: earning.currency });
      if (!countryId && countryRows[0]) setCountryId(countryRows[0].id);
    } catch {
      setError(t('loadFailed', 'Failed to load rental fleet.'));
    }
  }, [countryId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!make.trim() || !model.trim() || !plate.trim() || !countryId) return;
    try {
      await createRentalVehicle({
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        plate_number: plate.trim(),
        country: countryId,
        daily_price: dailyPrice,
        deposit_amount: '0',
      });
      setMake('');
      setModel('');
      setPlate('');
      await load();
    } catch {
      Alert.alert(t('error', 'Error'), t('saveFailed', 'Could not save vehicle.'));
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('carRental', 'Car Rental')}</Text>
      {earnings ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('partnerEarnings', 'Earnings')}</Text>
          <Text style={styles.meta}>
            {earnings.currency} {earnings.available_balance}
          </Text>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput style={styles.input} value={make} onChangeText={setMake} placeholder="Make" />
      <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="Model" />
      <TextInput style={styles.input} value={year} onChangeText={setYear} placeholder="Year" keyboardType="number-pad" />
      <TextInput style={styles.input} value={plate} onChangeText={setPlate} placeholder="Plate" />
      <TextInput style={styles.input} value={dailyPrice} onChangeText={setDailyPrice} placeholder="Daily price" keyboardType="decimal-pad" />
      <View style={styles.row}>
        {countries.map((country) => (
          <TouchableOpacity
            key={country.id}
            onPress={() => setCountryId(country.id)}
            style={[styles.chip, countryId === country.id && styles.chipActive]}
          >
            <Text style={countryId === country.id ? styles.chipActiveText : styles.chipText}>{country.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={() => void handleCreate()}>
        <Text style={styles.buttonText}>{t('add', 'Add')}</Text>
      </TouchableOpacity>
      {vehicles.map((vehicle) => (
        <View key={vehicle.id} style={styles.card}>
          <Text style={styles.cardTitle}>{vehicle.make} {vehicle.model}</Text>
          <Text style={styles.meta}>{vehicle.daily_price} {vehicle.currency}/day · {vehicle.is_approved ? t('approved', 'Approved') : t('pending', 'Pending')}</Text>
        </View>
      ))}
      <Text style={styles.title}>{t('bookings', 'Bookings')}</Text>
      {bookings.map((booking) => (
        <View key={booking.id} style={styles.card}>
          <Text style={styles.cardTitle}>{booking.booking_number}</Text>
          <Text style={styles.meta}>{booking.status} · {booking.start_date} → {booking.end_date}</Text>
          {booking.status === 'pending' ? (
            <TouchableOpacity style={styles.smallButton} onPress={() => void updateRentalBookingStatus(booking.id, 'approved').then(load)}>
              <Text style={styles.buttonText}>{t('approve', 'Approve')}</Text>
            </TouchableOpacity>
          ) : null}
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
  smallButton: { backgroundColor: theme.colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8, alignSelf: 'flex-start' },
  buttonText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: theme.colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  cardTitle: { fontWeight: '700', color: theme.colors.text },
  meta: { color: theme.colors.textSecondary, marginTop: 4 },
});
