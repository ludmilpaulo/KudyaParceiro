import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useCreateGroceryProductMutation, useGetGroceryMetaQuery } from '../../redux/slices/partnerApi';

const STEPS = ['Product Information', 'Photos', 'Pricing & Unit', 'Inventory', 'Review & Publish'];

export default function GroceryAddProductScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fresh Produce');
  const [sellingUnit, setSellingUnit] = useState('item');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [threshold, setThreshold] = useState('10');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('');
  const { data: meta } = useGetGroceryMetaQuery();
  const [createProduct, { isLoading }] = useCreateGroceryProductMutation();
  const units = Array.isArray(meta?.selling_units) ? meta.selling_units : [];
  const categories = Array.isArray(meta?.categories) ? meta.categories : [];

  async function publish() {
    const body = new FormData();
    body.append('name', name);
    body.append('description', description);
    body.append('category', category);
    body.append('selling_unit', sellingUnit);
    body.append('stock_unit', sellingUnit);
    body.append('price', price);
    body.append('stock_quantity', stock);
    body.append('low_stock_threshold', threshold);
    if (weight) {
      body.append('weight', weight);
      body.append('weight_unit', weightUnit || (sellingUnit === 'pack' ? 'gram' : sellingUnit));
    }
    body.append('publish', 'true');
    try {
      await createProduct(body).unwrap();
      Alert.alert('Product published');
      navigation.goBack();
    } catch {
      Alert.alert('Could not save product');
    }
  }

  return (
    <ScrollView contentContainerStyle={tw`p-4 pb-12`}>
      <Text style={tw`text-xl font-bold`}>{STEPS[step]}</Text>
      {step === 0 && (
        <View>
          <TextInput style={tw`mt-4 rounded-xl border border-slate-200 px-3 py-3`} placeholder="Product name" value={name} onChangeText={setName} />
          <TextInput style={tw`mt-3 rounded-xl border border-slate-200 px-3 py-3`} placeholder="Description" value={description} onChangeText={setDescription} />
          <Text style={tw`mt-3 text-sm text-slate-500`}>Category</Text>
          {categories.map((item) => {
            const row = item as Record<string, unknown>;
            const label = String(row.name || '');
            return (
              <Pressable key={label} onPress={() => setCategory(label)} style={tw`mt-2 rounded-xl px-3 py-3 ${category === label ? 'bg-emerald-600' : 'bg-white'}`}>
                <Text style={tw`${category === label ? 'text-white' : 'text-slate-800'}`}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {step === 1 && <Text style={tw`mt-6 text-slate-500`}>You can add photos from the web dashboard or the next inventory update. Continue to set pricing.</Text>}
      {step === 2 && (
        <View>
          <Text style={tw`mt-4 text-sm`}>Sold by</Text>
          {(units.length ? units : [{ value: 'item', label: 'Item' }, { value: 'kg', label: 'Kg' }, { value: 'pack', label: 'Pack' }]).map((unit) => {
            const row = unit as Record<string, unknown>;
            const value = String(row.value);
            return (
              <Pressable key={value} onPress={() => setSellingUnit(value)} style={tw`mt-2 rounded-xl px-3 py-3 ${sellingUnit === value ? 'bg-emerald-600' : 'bg-white'}`}>
                <Text style={tw`${sellingUnit === value ? 'text-white' : 'text-slate-800'}`}>{String(row.label)}</Text>
              </Pressable>
            );
          })}
          <TextInput style={tw`mt-4 rounded-xl border px-3 py-3`} keyboardType="decimal-pad" placeholder={`Price per ${sellingUnit}`} value={price} onChangeText={setPrice} />
          <TextInput style={tw`mt-3 rounded-xl border px-3 py-3`} keyboardType="decimal-pad" placeholder="Pack weight (optional, e.g. 500)" value={weight} onChangeText={setWeight} />
          {weight ? (
            <View style={tw`mt-2 flex-row flex-wrap`}>
              {['gram', 'kg', 'litre', 'millilitre'].map((unit) => (
                <Pressable key={unit} onPress={() => setWeightUnit(unit)} style={tw`mr-2 mb-2 rounded-full px-3 py-2 ${weightUnit === unit ? 'bg-emerald-600' : 'bg-white'}`}>
                  <Text style={tw`${weightUnit === unit ? 'text-white' : 'text-slate-800'}`}>{unit}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      )}
      {step === 3 && (
        <View>
          <TextInput style={tw`mt-4 rounded-xl border px-3 py-3`} keyboardType="decimal-pad" placeholder={`Available quantity (${sellingUnit})`} value={stock} onChangeText={setStock} />
          <TextInput style={tw`mt-3 rounded-xl border px-3 py-3`} keyboardType="decimal-pad" placeholder="Low stock threshold" value={threshold} onChangeText={setThreshold} />
        </View>
      )}
      {step === 4 && (
        <View style={tw`mt-4 rounded-2xl bg-white p-4`}>
          <Text style={tw`font-bold`}>{name || 'Untitled'}</Text>
          <Text>{description}</Text>
          <Text>{price} / {sellingUnit}</Text>
          <Text>{stock} {sellingUnit} in stock</Text>
        </View>
      )}
      <View style={tw`mt-6 flex-row`}>
        {step > 0 ? (
          <Pressable onPress={() => setStep(step - 1)} style={tw`mr-3 flex-1 rounded-xl border py-3`}>
            <Text style={tw`text-center`}>Back</Text>
          </Pressable>
        ) : null}
        <Pressable
          disabled={isLoading}
          onPress={() => (step === STEPS.length - 1 ? publish() : setStep(step + 1))}
          style={tw`flex-1 rounded-xl bg-emerald-600 py-3`}
        >
          <Text style={tw`text-center font-semibold text-white`}>{step === STEPS.length - 1 ? 'Publish' : 'Next'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
