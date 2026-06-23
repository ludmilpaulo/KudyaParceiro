import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import {
  useAcceptDeliveryMutation,
  useGetActiveDeliveriesQuery,
  useGetAvailableDeliveriesQuery,
  type FulfillmentDelivery,
} from '../../../redux/api/fulfillmentApi';

type Props = {
  enabled: boolean;
};

function DeliveryRow({
  item,
  onAccept,
  accepting,
}: {
  item: FulfillmentDelivery;
  onAccept: (id: number) => void;
  accepting: boolean;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.request_number || `Delivery #${item.id}`}</Text>
      <Text style={styles.cardMeta}>{item.request_type || 'delivery'} · {item.status}</Text>
      {item.pickup_address ? <Text style={styles.cardBody}>Pickup: {item.pickup_address}</Text> : null}
      {item.delivery_address ? <Text style={styles.cardBody}>Dropoff: {item.delivery_address}</Text> : null}
      {item.status === 'pending' ? (
        <Pressable style={styles.acceptBtn} onPress={() => onAccept(item.id)} disabled={accepting}>
          <Text style={styles.acceptText}>{accepting ? '…' : 'Accept'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function FulfillmentPanel({ enabled }: Props) {
  const { data: available = [], isLoading, isFetching, refetch } = useGetAvailableDeliveriesQuery(undefined, {
    pollingInterval: enabled ? 15000 : 0,
    skip: !enabled,
  });
  const { data: active = [] } = useGetActiveDeliveriesQuery(undefined, {
    pollingInterval: enabled ? 15000 : 0,
    skip: !enabled,
  });
  const [acceptDelivery, { isLoading: accepting }] = useAcceptDeliveryMutation();

  if (!enabled) return null;

  const handleAccept = async (id: number) => {
    try {
      await acceptDelivery(id).unwrap();
      void refetch();
    } catch {
      // surfaced by RTK
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Fulfillment (v1)</Text>
        {(isLoading || isFetching) && <ActivityIndicator size="small" color="#2563eb" />}
      </View>

      {active.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Active</Text>
          {active.map((item) => (
            <DeliveryRow key={`active-${item.id}`} item={item} onAccept={handleAccept} accepting={accepting} />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Available</Text>
        {available.length === 0 ? (
          <Text style={styles.empty}>No fulfillment jobs right now.</Text>
        ) : (
          available.map((item) => (
            <DeliveryRow key={`avail-${item.id}`} item={item} onAccept={handleAccept} accepting={accepting} />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  section: { marginTop: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 6 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontWeight: '700', color: '#0f172a' },
  cardMeta: { color: '#64748b', fontSize: 12, marginTop: 4 },
  cardBody: { color: '#334155', fontSize: 13, marginTop: 4 },
  acceptBtn: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { color: '#94a3b8', fontStyle: 'italic' },
});
