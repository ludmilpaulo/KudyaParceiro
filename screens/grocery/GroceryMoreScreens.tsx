import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import tw from 'twrnc';
import {
  useCreateGroceryPromotionMutation,
  useGetGroceryDashboardQuery,
  useGetGroceryProductsQuery,
  useGetGroceryPromotionsQuery,
  useGetGroceryRevenueQuery,
  useGetGrocerySalesQuery,
  useUpdateGroceryAvailabilityMutation,
  useUpdateGroceryStoreMutation,
} from '../../redux/slices/partnerApi';

function money(value: unknown) {
  return `R${Number(value || 0).toFixed(2)}`;
}

export function GrocerySalesScreen() {
  const [range, setRange] = useState('7d');
  const { data, isLoading, error } = useGetGrocerySalesQuery(range);
  const summary = (data?.summary || {}) as Record<string, number>;
  if (isLoading) return <CenteredLoader />;
  if (error) return <ErrorText>Could not load sales.</ErrorText>;
  return (
    <ScrollView contentContainerStyle={tw`p-4`}>
      <Text style={tw`mb-3 text-2xl font-bold`}>Sales</Text>
      <View style={tw`mb-4 flex-row flex-wrap`}>
        {['today', '7d', '30d', '3m', '12m'].map((item) => (
          <Pressable
            key={item}
            onPress={() => setRange(item)}
            style={tw`mr-2 mb-2 rounded-full px-3 py-2 ${range === item ? 'bg-emerald-700' : 'bg-white'}`}
          >
            <Text style={tw`${range === item ? 'text-white' : 'text-slate-700'} text-xs font-semibold`}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <Kpi label="Total sales" value={money(summary.total_sales)} />
      <Kpi label="Orders" value={String(summary.orders || 0)} />
      <Kpi label="Average order" value={money(summary.average_order_value)} />
      <Kpi label="Completed" value={String(summary.completed_orders || 0)} />
    </ScrollView>
  );
}

export function GroceryRevenueScreen() {
  const [range, setRange] = useState('month');
  const { data, isLoading, error } = useGetGroceryRevenueQuery({ range });
  if (isLoading) return <CenteredLoader />;
  if (error || !data) return <ErrorText>No revenue yet.</ErrorText>;
  const rows: Array<[string, unknown]> = [
    ['Gross sales', data.gross_sales],
    ['Kudya commission', data.commission],
    ['Delivery charges', data.delivery_charges],
    ['Discounts', data.discounts],
    ['Refunds', data.refunds],
    ['Net earnings', data.net_earnings],
    ['Pending payout', data.pending_payout],
    ['Paid out', data.paid_out],
  ];
  return (
    <ScrollView contentContainerStyle={tw`p-4`}>
      <Text style={tw`mb-3 text-2xl font-bold`}>Revenue</Text>
      <View style={tw`mb-4 flex-row flex-wrap`}>
        {['today', 'week', 'month'].map((item) => (
          <Pressable
            key={item}
            onPress={() => setRange(item)}
            style={tw`mr-2 mb-2 rounded-full px-3 py-2 ${range === item ? 'bg-emerald-700' : 'bg-white'}`}
          >
            <Text style={tw`${range === item ? 'text-white' : 'text-slate-700'} text-xs font-semibold`}>{item}</Text>
          </Pressable>
        ))}
      </View>
      {rows.map(([label, value]) => (
        <Kpi key={label} label={label} value={money(value)} />
      ))}
    </ScrollView>
  );
}

export function GroceryPromotionsScreen() {
  const { data = [], isLoading, error } = useGetGroceryPromotionsQuery();
  const { data: products = [] } = useGetGroceryProductsQuery();
  const [createPromo] = useCreateGroceryPromotionMutation();
  const [title, setTitle] = useState('Weekend Special');
  const [discountType, setDiscountType] = useState('percentage');
  const [value, setValue] = useState('10');
  const [productId, setProductId] = useState('');
  if (isLoading) return <CenteredLoader />;
  if (error) return <ErrorText>Could not load promotions.</ErrorText>;
  return (
    <ScrollView contentContainerStyle={tw`p-4 pb-10`}>
      <Text style={tw`mb-3 text-2xl font-bold`}>Promotions</Text>
      <TextInput style={tw`mb-2 rounded-xl border border-slate-200 bg-white px-3 py-3`} value={title} onChangeText={setTitle} placeholder="Title" />
      <TextInput style={tw`mb-2 rounded-xl border border-slate-200 bg-white px-3 py-3`} value={value} onChangeText={setValue} keyboardType="decimal-pad" placeholder="Discount value" />
      <View style={tw`mb-3 flex-row flex-wrap`}>
        {['percentage', 'fixed', 'bogo', 'multibuy', 'weekly'].map((item) => (
          <Pressable key={item} onPress={() => setDiscountType(item)} style={tw`mr-2 mb-2 rounded-full px-3 py-2 ${discountType === item ? 'bg-emerald-700' : 'bg-white'}`}>
            <Text style={tw`${discountType === item ? 'text-white' : 'text-slate-700'} text-xs font-semibold`}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={() =>
          createPromo({
            title,
            discount_type: discountType,
            discount_value: Number(value),
            product: productId ? Number(productId) : null,
            start_date: new Date().toISOString().slice(0, 10),
            end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
            min_quantity: 1,
            is_active: true,
          })
        }
        style={tw`mb-4 rounded-2xl bg-emerald-600 py-3`}
      >
        <Text style={tw`text-center font-semibold text-white`}>Create promotion</Text>
      </Pressable>
      {products.slice(0, 8).map((product) => (
        <Pressable key={String(product.id)} onPress={() => setProductId(String(product.id))} style={tw`mb-2 rounded-xl bg-white px-3 py-3 ${productId === String(product.id) ? 'border border-emerald-600' : ''}`}>
          <Text>{String(product.name)}</Text>
        </Pressable>
      ))}
      {data.length === 0 ? <Text style={tw`mt-4 text-slate-500`}>No promotions yet.</Text> : null}
      {data.map((promo) => (
        <View key={String(promo.id)} style={tw`mt-2 rounded-2xl bg-white p-4`}>
          <Text style={tw`font-semibold`}>{String(promo.title)}</Text>
          <Text style={tw`text-sm text-slate-500`}>
            {String(promo.discount_type)} · {String(promo.discount_value)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function GroceryProfileScreen() {
  const { data, isLoading } = useGetGroceryDashboardQuery();
  const [updateStore] = useUpdateGroceryStoreMutation();
  const [updateAvailability] = useUpdateGroceryAvailabilityMutation();
  const store = (data?.store || {}) as Record<string, unknown>;
  const [name, setName] = useState(String(store.name || ''));
  const [phone, setPhone] = useState(String(store.phone || ''));
  const [address, setAddress] = useState(String(store.address || ''));
  const accepting = Boolean(data?.accepting_orders ?? store.accepting_orders);
  if (isLoading) return <CenteredLoader />;
  return (
    <ScrollView contentContainerStyle={tw`p-4 pb-10`}>
      <Text style={tw`mb-3 text-2xl font-bold`}>Store Profile</Text>
      <Pressable
        onPress={() => updateAvailability({ accepting_orders: !accepting })}
        style={tw`mb-4 rounded-2xl ${accepting ? 'bg-emerald-600' : 'bg-slate-300'} py-4`}
      >
        <Text style={tw`text-center font-bold ${accepting ? 'text-white' : 'text-slate-700'}`}>
          {accepting ? 'Store accepting orders' : 'Store temporarily unavailable'}
        </Text>
      </Pressable>
      <TextInput style={tw`mb-2 rounded-xl border border-slate-200 bg-white px-3 py-3`} value={name} onChangeText={setName} placeholder="Store name" />
      <TextInput style={tw`mb-2 rounded-xl border border-slate-200 bg-white px-3 py-3`} value={phone} onChangeText={setPhone} placeholder="Phone" />
      <TextInput style={tw`mb-4 rounded-xl border border-slate-200 bg-white px-3 py-3`} value={address} onChangeText={setAddress} placeholder="Address" />
      <Pressable onPress={() => updateStore({ name, phone, address })} style={tw`rounded-2xl bg-emerald-600 py-3`}>
        <Text style={tw`text-center font-semibold text-white`}>Save profile</Text>
      </Pressable>
    </ScrollView>
  );
}

export function GrocerySupportScreen() {
  return (
    <ScrollView contentContainerStyle={tw`p-4`}>
      <Text style={tw`mb-3 text-2xl font-bold`}>Help & Support</Text>
      <View style={tw`rounded-2xl bg-white p-4`}>
        <Text style={tw`font-semibold`}>Grocery partner tips</Text>
        <Text style={tw`mt-2 text-slate-600`}>
          Use kg/g/litre for produce and liquids. Packs and trays keep a fixed pack price with optional weight.
        </Text>
        <Text style={tw`mt-2 text-slate-600`}>
          Low-stock alerts use each product threshold. Out-of-stock items stay visible to you but cannot be purchased.
        </Text>
      </View>
    </ScrollView>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={tw`mb-3 rounded-2xl bg-white p-4`}>
      <Text style={tw`text-xs text-slate-500`}>{label}</Text>
      <Text style={tw`mt-1 text-xl font-bold`}>{value}</Text>
    </View>
  );
}

function CenteredLoader() {
  return (
    <View style={tw`flex-1 items-center justify-center`}>
      <ActivityIndicator color="#059669" />
    </View>
  );
}

function ErrorText({ children }: { children: string }) {
  return <Text style={tw`p-6 text-slate-500`}>{children}</Text>;
}
