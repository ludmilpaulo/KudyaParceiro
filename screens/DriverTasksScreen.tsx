import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as Location from 'expo-location';
import tw from 'twrnc';
import { selectUser } from '../redux/slices/authSlice';
import {
  acceptRideOffer,
  DriverRideOffer,
  fetchDriverOffers,
  rejectRideOffer,
  sendRideCounterOffer,
  updateDriverRideLocation,
} from '../services/ridesService';
import { setDriverOnlineForService } from '../services/driverAvailabilityService';
import { useDriverTranslation } from '../hooks/useDriverTranslation';
import { useDriverCapabilities } from '../hooks/useDriverCapabilities';
import { canGoOnlineForService, serviceBlockedMessage } from '../utils/driverServiceModes';

function OfferCountdown({ expiresAt, onExpired }: { expiresAt: string; onExpired: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const tick = setInterval(() => {
      const left = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        onExpired();
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [expiresAt, onExpired]);

  return (
    <View style={tw`px-3 py-1 rounded-full ${secondsLeft <= 5 ? 'bg-red-100' : 'bg-amber-100'}`}>
      <Text style={tw`text-sm font-bold ${secondsLeft <= 5 ? 'text-red-700' : 'text-amber-800'}`}>
        {secondsLeft}s
      </Text>
    </View>
  );
}

export default function DriverTasksScreen() {
  const { dt } = useDriverTranslation();
  const { showTaxi, modes } = useDriverCapabilities();
  const user = useSelector(selectUser) as { access_token?: string; token?: string } | null;
  const token = user?.access_token ?? user?.token ?? '';
  const [offers, setOffers] = useState<DriverRideOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [counterOffer, setCounterOffer] = useState<DriverRideOffer | null>(null);
  const [counterAmount, setCounterAmount] = useState('');

  const load = useCallback(async () => {
    if (!token) {
      setOffers([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await fetchDriverOffers(token);
      setOffers(data);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!isOnline || !token) return;

    let cancelled = false;
    const pushLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await updateDriverRideLocation(token, loc.coords.latitude, loc.coords.longitude);
      } catch {
        // ignore location errors
      }
    };

    void pushLocation();
    const interval = setInterval(pushLocation, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOnline, token]);

  const toggleOnline = async (value: boolean) => {
    if (!token) {
      Alert.alert('Login', 'Driver token required');
      return;
    }
    if (value && !canGoOnlineForService(modes, 'taxi')) {
      Alert.alert(dt('error'), serviceBlockedMessage('taxi'));
      return;
    }
    const result = await setDriverOnlineForService(token, value, 'taxi');
    if (result.ok) {
      setIsOnline(Boolean(result.is_online));
      if (value) load();
    } else {
      Alert.alert(dt('error'), result.detail || dt('goOnlineBlocked'));
    }
  };

  const onAccept = async (offer: DriverRideOffer) => {
    if (!token) return;
    const ok = await acceptRideOffer(token, offer.ride_id, offer.id);
    if (ok) {
      Alert.alert('Accepted', 'Ride accepted — navigate to pickup');
      load();
    } else {
      Alert.alert('Error', 'Could not accept ride (offer may have expired)');
      load();
    }
  };

  const onCounter = async () => {
    if (!token || !counterOffer) return;
    const amount = parseFloat(counterAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert(dt('error'), dt('counterOfferHint'));
      return;
    }
    const ok = await sendRideCounterOffer(token, counterOffer.ride_id, counterOffer.id, amount);
    setCounterOffer(null);
    setCounterAmount('');
    if (ok) {
      Alert.alert(dt('success'), dt('sendCounterOffer'));
      load();
    } else {
      Alert.alert(dt('error'), dt('error'));
      load();
    }
  };

  const clientPrice = (item: DriverRideOffer) => item.customer_price_offer ?? item.estimated_price;

  const onReject = async (offer: DriverRideOffer) => {
    if (!token) return;
    await rejectRideOffer(token, offer.ride_id, offer.id);
    load();
  };

  const openCounterModal = (offer: DriverRideOffer) => {
    setCounterOffer(offer);
    const base = parseFloat(clientPrice(offer));
    setCounterAmount(Number.isFinite(base) ? String(Math.ceil(base + 10)) : '');
  };

  return (
    <View style={tw`flex-1 bg-slate-50 p-4`}>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-xl font-bold text-slate-900`}>Ride offers</Text>
        {showTaxi ? (
          <View style={tw`flex-row items-center`}>
            <Text style={tw`mr-2 text-slate-600 font-medium`}>{isOnline ? 'Online' : 'Offline'}</Text>
            <Switch value={isOnline} onValueChange={toggleOnline} />
          </View>
        ) : null}
      </View>

      {!showTaxi ? (
        <Text style={tw`text-slate-500 text-center mt-10 px-4`}>
          Your approved vehicle is not configured for taxi / ride services. Contact Kudya support if this is incorrect.
        </Text>
      ) : !isOnline ? (
        <Text style={tw`text-slate-500 text-center mt-10 px-4`}>
          Go online to receive nearby ride requests with expanding search radius.
        </Text>
      ) : loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
          }
          ListEmptyComponent={
            <Text style={tw`text-slate-500 text-center mt-10`}>
              Waiting for ride offers in your area...
            </Text>
          }
          renderItem={({ item }) => (
            <View style={tw`bg-white rounded-2xl p-4 mb-3 border border-slate-100`}>
              <View style={tw`flex-row justify-between items-start mb-2`}>
                <Text style={tw`font-bold text-slate-900`}>{item.ride_number}</Text>
                <OfferCountdown expiresAt={item.expires_at} onExpired={load} />
              </View>
              <Text style={tw`text-xs text-blue-600 mb-2`}>
                {item.distance_to_pickup_km} km away · ~{item.estimated_pickup_minutes} min · {item.search_radius_km} km search
              </Text>
              {(item.stop_count ?? item.stops?.length ?? 0) > 0 ? (
                <View style={tw`bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2`}>
                  <Text style={tw`text-xs font-bold text-amber-800 mb-1`}>
                    {item.stop_count ?? item.stops?.length} {dt('extraStops')}
                  </Text>
                  {(item.stops ?? [])
                    .slice()
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((stop, index) => (
                      <Text key={stop.id} style={tw`text-xs text-amber-900`}>
                        {index + 1}. {stop.address}
                      </Text>
                    ))}
                </View>
              ) : null}
              <Text style={tw`text-sm text-slate-600`}>{item.pickup_address}</Text>
              {(item.stops ?? [])
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((stop, index) => (
                  <Text key={stop.id} style={tw`text-sm text-amber-700`}>
                    → {dt('stop')} {index + 1}: {stop.address}
                  </Text>
                ))}
              <Text style={tw`text-sm text-slate-600`}>→ {item.destination_address}</Text>
              <Text style={tw`text-xs text-slate-500 mt-1`}>
                {item.distance_km ? `${item.distance_km} km · ~${item.duration_minutes ?? '?'} min · ` : ''}
                {dt('payment')}: {item.payment_method ?? 'cash'}
              </Text>
              <Text style={tw`text-xs text-slate-500 mt-1`}>
                {dt('defaultPrice')}: {item.currency} {item.default_calculated_price ?? item.estimated_price}
              </Text>
              <Text style={tw`text-blue-700 font-bold mt-1`}>
                {dt('clientOffer')}: {item.currency} {clientPrice(item)}
              </Text>
              <View style={tw`flex-row gap-2 mt-3`}>
                <TouchableOpacity
                  style={tw`flex-1 bg-slate-100 rounded-xl py-3 items-center`}
                  onPress={() => onReject(item)}
                >
                  <Text style={tw`text-slate-700 font-bold`}>{dt('decline')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`flex-1 bg-amber-500 rounded-xl py-3 items-center`}
                  onPress={() => openCounterModal(item)}
                >
                  <Text style={tw`text-white font-bold`}>{dt('counterOffer')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`flex-1 bg-blue-600 rounded-xl py-3 items-center`}
                  onPress={() => onAccept(item)}
                >
                  <Text style={tw`text-white font-bold`}>{dt('acceptOffer')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={Boolean(counterOffer)} transparent animationType="slide">
        <View style={tw`flex-1 justify-end bg-black/40`}>
          <View style={tw`bg-white rounded-t-3xl p-5`}>
            <Text style={tw`text-lg font-bold text-slate-900 mb-2`}>{dt('counterOffer')}</Text>
            <Text style={tw`text-slate-600 mb-3`}>{dt('counterOfferHint')}</Text>
            <TextInput
              style={tw`border border-slate-200 rounded-xl px-4 py-3 text-lg mb-4`}
              keyboardType="decimal-pad"
              value={counterAmount}
              onChangeText={setCounterAmount}
              placeholder="0.00"
            />
            <View style={tw`flex-row gap-2`}>
              <TouchableOpacity
                style={tw`flex-1 bg-slate-100 rounded-xl py-3 items-center`}
                onPress={() => { setCounterOffer(null); setCounterAmount(''); }}
              >
                <Text style={tw`font-bold text-slate-700`}>{dt('decline')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`flex-1 bg-blue-600 rounded-xl py-3 items-center`}
                onPress={onCounter}
              >
                <Text style={tw`font-bold text-white`}>{dt('sendCounterOffer')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
