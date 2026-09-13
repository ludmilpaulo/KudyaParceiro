import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import tw from 'twrnc';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../../redux/slices/authSlice';
import { useGetGroceryDashboardQuery, useUpdateGroceryAvailabilityMutation } from '../../redux/slices/partnerApi';

const LINKS = [
  { label: 'Sales', screen: 'GrocerySales', hint: 'Totals for today, 7 days, and longer ranges' },
  { label: 'Revenue', screen: 'GroceryRevenue', hint: 'Gross sales, commission, and payouts' },
  { label: 'Promotions', screen: 'GroceryPromotions', hint: 'Percentage, BOGO, and weekly deals' },
  { label: 'Store Profile', screen: 'GroceryProfile', hint: 'Name, pause orders, and contact details' },
  { label: 'Settings', screen: 'GroceryProfile', hint: 'Availability and store details' },
  { label: 'Support', screen: 'GrocerySupport', hint: 'Help for grocery partners' },
] as const;

export default function GroceryMoreScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { data } = useGetGroceryDashboardQuery();
  const [updateAvailability] = useUpdateGroceryAvailabilityMutation();
  const accepting = Boolean(data?.accepting_orders);
  return (
    <ScrollView contentContainerStyle={tw`p-4`}>
      <Text style={tw`mb-4 text-2xl font-bold`}>More</Text>
      {LINKS.map((item) => (
        <Pressable
          key={item.label}
          onPress={() => navigation.navigate(item.screen as never)}
          style={tw`mb-2 rounded-2xl bg-white px-4 py-4`}
        >
          <Text style={tw`font-semibold`}>{item.label}</Text>
          <Text style={tw`text-xs text-slate-500`}>{item.hint}</Text>
        </Pressable>
      ))}
      <Pressable
        onPress={() => updateAvailability({ accepting_orders: !accepting })}
        style={tw`mt-4 rounded-2xl ${accepting ? 'bg-emerald-600' : 'bg-slate-300'} py-4`}
      >
        <Text style={tw`text-center font-bold ${accepting ? 'text-white' : 'text-slate-700'}`}>
          {accepting ? 'Store accepting orders' : 'Store temporarily unavailable'}
        </Text>
      </Pressable>
      <Pressable onPress={() => dispatch(logoutUser())} style={tw`mt-4 rounded-2xl border border-rose-200 py-4`}>
        <Text style={tw`text-center font-semibold text-rose-700`}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}
