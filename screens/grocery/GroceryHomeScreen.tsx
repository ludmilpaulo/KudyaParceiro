import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGetGroceryDashboardQuery } from '../../redux/slices/partnerApi';

type TabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Products: undefined;
  Inventory: undefined;
  More: undefined;
};
type StackParamList = {
  GroceryTabs: undefined;
  GroceryAddProduct: undefined;
};
type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Dashboard'>,
  NativeStackNavigationProp<StackParamList>
>;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function GroceryHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, error, refetch } = useGetGroceryDashboardQuery();
  const kpis = (data?.kpis || {}) as Record<string, number>;
  const orders = Array.isArray(data?.recent_orders) ? data.recent_orders : [];

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator color="#059669" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white px-6`}>
        <Text style={tw`text-center text-slate-600`}>Could not load your grocery dashboard.</Text>
        <Pressable onPress={() => refetch()} style={tw`mt-4 rounded-xl bg-emerald-600 px-4 py-3`}>
          <Text style={tw`font-semibold text-white`}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-slate-50`} contentContainerStyle={tw`p-4 pb-10`}>
      <Text style={tw`text-2xl font-bold text-slate-900`}>
        {greeting()} 👋
      </Text>
      <Text style={tw`mt-1 text-slate-500`}>Here's what's happening with your store today.</Text>

      <View style={tw`mt-4 flex-row flex-wrap`}>
        <Kpi label="Today's Sales" value={`R${Number(kpis.sales_today || 0).toFixed(2)}`} />
        <Kpi label="Orders" value={String(kpis.orders_today || 0)} />
        <Kpi label="Low Stock" value={String(kpis.low_stock || 0)} />
      </View>

      <Pressable onPress={() => navigation.navigate('GroceryAddProduct')} style={tw`mt-4 rounded-2xl bg-emerald-600 py-4`}>
        <Text style={tw`text-center text-lg font-bold text-white`}>+ Add Product</Text>
      </Pressable>
      <View style={tw`mt-3 flex-row gap-3`}>
        <Pressable onPress={() => navigation.navigate('Orders')} style={tw`flex-1 rounded-2xl bg-white py-4`}>
          <Text style={tw`text-center font-semibold text-emerald-800`}>View Orders</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Inventory')} style={tw`flex-1 rounded-2xl bg-white py-4`}>
          <Text style={tw`text-center font-semibold text-emerald-800`}>Update Inventory</Text>
        </Pressable>
      </View>

      <Text style={tw`mt-6 mb-2 text-lg font-semibold`}>Recent Orders</Text>
      {orders.length === 0 ? (
        <Text style={tw`text-slate-500`}>No orders yet.</Text>
      ) : (
        orders.map((order) => {
          const row = order as Record<string, unknown>;
          const customer = row.customer as Record<string, unknown> | undefined;
          return (
            <View key={String(row.id)} style={tw`mb-2 flex-row items-center justify-between rounded-2xl bg-white px-4 py-3`}>
              <Text style={tw`font-semibold`}>#{String(row.id)}</Text>
              <Text>R{Number(row.total || 0).toFixed(0)}</Text>
              <Text style={tw`text-xs font-bold uppercase text-emerald-700`}>
                {String(row.grocery_status || row.status || 'NEW')}
              </Text>
              {customer ? <Text style={tw`hidden`}>{String(customer.name || '')}</Text> : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={tw`mb-3 mr-3 w-[47%] rounded-2xl bg-white p-4`}>
      <Text style={tw`text-xs text-slate-500`}>{label}</Text>
      <Text style={tw`mt-1 text-xl font-bold text-slate-900`}>{value}</Text>
    </View>
  );
}
