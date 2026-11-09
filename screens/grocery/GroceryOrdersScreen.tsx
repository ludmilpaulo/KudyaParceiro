import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';
import { useGetGroceryOrdersQuery, usePickGroceryOrderItemMutation, useUpdateGroceryOrderStatusMutation } from '../../redux/slices/partnerApi';

export default function GroceryOrdersScreen() {
  const { data = [], isLoading, error } = useGetGroceryOrdersQuery();
  const [updateStatus] = useUpdateGroceryOrderStatusMutation();
  const [pickItem] = usePickGroceryOrderItemMutation();

  if (isLoading) return <View style={tw`flex-1 items-center justify-center`}><ActivityIndicator color="#059669" /></View>;
  if (error) return <Text style={tw`p-6 text-slate-500`}>Could not load orders.</Text>;
  if (data.length === 0) return <Text style={tw`p-6 text-slate-500`}>No grocery orders yet.</Text>;

  return (
    <ScrollView contentContainerStyle={tw`p-4`}>
      {data.map((order) => {
        const status = String(order.grocery_status || 'new');
        const details = Array.isArray(order.order_details) ? order.order_details : [];
        return (
          <View key={String(order.id)} style={tw`mb-4 rounded-2xl bg-white p-4`}>
            <Text style={tw`text-lg font-bold`}>#{String(order.id)}</Text>
            <Text style={tw`text-slate-500`}>{details.length} products · R{Number(order.total || 0).toFixed(2)}</Text>
            <Text style={tw`mt-1 font-semibold uppercase text-emerald-700`}>{status}</Text>
            {details.map((line) => {
              const row = line as Record<string, unknown>;
              const product = (row.product || {}) as Record<string, unknown>;
              const pickStatus = String(row.pick_status || 'pending');
              return (
                <View key={String(row.id)} style={tw`mt-2 rounded-xl bg-slate-50 px-3 py-2`}>
                  <Text style={tw`text-sm`}>
                    {pickStatus === 'found' ? '☑' : '☐'} {String(product.name || 'Item')} — {String(row.quantity)} {String(row.selling_unit || '')}
                  </Text>
                  {status === 'accepted' || status === 'preparing' ? (
                    <View style={tw`mt-2 flex-row`}>
                      <Pressable onPress={() => pickItem({ orderId: Number(order.id), itemId: Number(row.id), pick_status: 'found' })} style={tw`mr-2 rounded-lg bg-emerald-600 px-2 py-1`}>
                        <Text style={tw`text-xs text-white`}>Found</Text>
                      </Pressable>
                      <Pressable onPress={() => pickItem({ orderId: Number(order.id), itemId: Number(row.id), pick_status: 'missing' })} style={tw`rounded-lg bg-amber-100 px-2 py-1`}>
                        <Text style={tw`text-xs text-amber-800`}>Missing</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
            {status === 'new' ? (
              <View style={tw`mt-3 flex-row gap-2`}>
                <Pressable onPress={() => updateStatus({ id: Number(order.id), status: 'accepted' })} style={tw`flex-1 rounded-xl bg-emerald-600 py-3`}>
                  <Text style={tw`text-center font-semibold text-white`}>Accept</Text>
                </Pressable>
                <Pressable onPress={() => updateStatus({ id: Number(order.id), status: 'cancelled' })} style={tw`flex-1 rounded-xl border border-rose-300 py-3`}>
                  <Text style={tw`text-center font-semibold text-rose-700`}>Reject</Text>
                </Pressable>
              </View>
            ) : null}
            {status === 'accepted' ? (
              <Pressable onPress={() => updateStatus({ id: Number(order.id), status: 'preparing' })} style={tw`mt-3 rounded-xl bg-emerald-600 py-3`}>
                <Text style={tw`text-center font-semibold text-white`}>Start Preparing</Text>
              </Pressable>
            ) : null}
            {status === 'preparing' ? (
              <Pressable onPress={() => updateStatus({ id: Number(order.id), status: 'ready' })} style={tw`mt-3 rounded-xl bg-emerald-600 py-3`}>
                <Text style={tw`text-center font-semibold text-white`}>Ready for Pickup</Text>
              </Pressable>
            ) : null}
            {status === 'ready' ? (
              <Pressable onPress={() => updateStatus({ id: Number(order.id), status: 'packed' })} style={tw`mt-3 rounded-xl bg-emerald-600 py-3`}>
                <Text style={tw`text-center font-semibold text-white`}>Pack order</Text>
              </Pressable>
            ) : null}
            {status === 'packed' ? (
              <Pressable onPress={() => updateStatus({ id: Number(order.id), status: 'courier_assigned' })} style={tw`mt-3 rounded-xl bg-emerald-600 py-3`}>
                <Text style={tw`text-center font-semibold text-white`}>Assign courier</Text>
              </Pressable>
            ) : null}
            {status === 'courier_assigned' || status === 'picked_up' || status === 'handed_to_driver' ? (
              <Pressable onPress={() => updateStatus({ id: Number(order.id), status: status === 'courier_assigned' ? 'out_for_delivery' : 'delivered' })} style={tw`mt-3 rounded-xl bg-emerald-600 py-3`}>
                <Text style={tw`text-center font-semibold text-white`}>{status === 'courier_assigned' ? 'Out for delivery' : 'Mark delivered'}</Text>
              </Pressable>
            ) : null}
            {status === 'out_for_delivery' ? (
              <Pressable onPress={() => updateStatus({ id: Number(order.id), status: 'delivered' })} style={tw`mt-3 rounded-xl bg-emerald-600 py-3`}>
                <Text style={tw`text-center font-semibold text-white`}>Mark delivered</Text>
              </Pressable>
            ) : null}
            {status === 'delivered' ? (
              <Pressable onPress={() => updateStatus({ id: Number(order.id), status: 'completed' })} style={tw`mt-3 rounded-xl bg-emerald-600 py-3`}>
                <Text style={tw`text-center font-semibold text-white`}>Complete order</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}
