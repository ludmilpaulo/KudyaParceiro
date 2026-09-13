import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useAdjustGroceryStockMutation, useGetGroceryProductsQuery } from '../../redux/slices/partnerApi';

export default function GroceryProductsScreen() {
  const navigation = useNavigation();
  const { data = [], isLoading, error } = useGetGroceryProductsQuery();
  const [adjust] = useAdjustGroceryStockMutation();

  if (isLoading) return <View style={tw`flex-1 items-center justify-center`}><ActivityIndicator color="#059669" /></View>;
  if (error) return <Text style={tw`p-6 text-slate-500`}>Could not load products.</Text>;

  return (
    <ScrollView contentContainerStyle={tw`p-4 pb-10`}>
      <Pressable onPress={() => navigation.navigate('GroceryAddProduct' as never)} style={tw`mb-4 rounded-2xl bg-emerald-600 py-4`}>
        <Text style={tw`text-center font-bold text-white`}>+ Add Product</Text>
      </Pressable>
      {data.length === 0 ? <Text style={tw`text-slate-500`}>No products yet.</Text> : null}
      {data.map((product) => {
        const unit = String(product.selling_unit || product.stock_unit || 'item');
        const qty = Number(product.stock_quantity || product.stock || 0);
        return (
          <View key={String(product.id)} style={tw`mb-3 rounded-2xl bg-white p-4`}>
            <Text style={tw`text-lg font-bold`}>{String(product.name)}</Text>
            <Text style={tw`text-slate-500`}>{qty} {unit} available</Text>
            <Text style={tw`font-semibold text-emerald-800`}>{String(product.price_display || `R${Number(product.price || 0).toFixed(2)} / ${unit}`)}</Text>
            <View style={tw`mt-3 flex-row items-center`}>
              <Pressable onPress={() => adjust({ id: Number(product.id), adjustment: -1, reason: 'manual' })} style={tw`h-10 w-10 items-center justify-center rounded-xl bg-slate-100`}>
                <Text style={tw`text-xl`}>−</Text>
              </Pressable>
              <Text style={tw`mx-4 font-bold`}>{qty}</Text>
              <Pressable onPress={() => adjust({ id: Number(product.id), adjustment: 1, reason: 'received' })} style={tw`h-10 w-10 items-center justify-center rounded-xl bg-slate-100`}>
                <Text style={tw`text-xl`}>+</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
