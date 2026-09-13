import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';
import { useAdjustGroceryStockMutation, useGetGroceryInventoryQuery } from '../../redux/slices/partnerApi';

export default function GroceryInventoryScreen() {
  const { data = [], isLoading, error } = useGetGroceryInventoryQuery();
  const [adjust] = useAdjustGroceryStockMutation();

  if (isLoading) return <View style={tw`flex-1 items-center justify-center`}><ActivityIndicator color="#059669" /></View>;
  if (error) return <Text style={tw`p-6 text-slate-500`}>Could not load inventory.</Text>;
  if (data.length === 0) return <Text style={tw`p-6 text-slate-500`}>No inventory yet.</Text>;

  return (
    <ScrollView contentContainerStyle={tw`p-4`}>
      {data.map((product) => (
        <View key={String(product.id)} style={tw`mb-3 rounded-2xl bg-white p-4`}>
          <Text style={tw`font-bold`}>{String(product.name)}</Text>
          <Text style={tw`text-slate-500`}>
            {String(product.stock_quantity)} {String(product.stock_unit || product.selling_unit)} · {String(product.inventory_status)}
          </Text>
          <View style={tw`mt-3 flex-row`}>
            <Pressable onPress={() => adjust({ id: Number(product.id), adjustment: -1 })} style={tw`mr-2 rounded-xl bg-slate-100 px-4 py-2`}>
              <Text>−</Text>
            </Pressable>
            <Pressable onPress={() => adjust({ id: Number(product.id), adjustment: 1, reason: 'received' })} style={tw`rounded-xl bg-emerald-600 px-4 py-2`}>
              <Text style={tw`text-white`}>+</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
