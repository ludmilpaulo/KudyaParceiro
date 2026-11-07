import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import tailwind from 'twrnc';
import { OpeningHourType } from '../../services/types';
import { createOpeningHour, deleteOpeningHour, updateOpeningHour } from '../../services/apiService';
import { WEEK_DAYS_PT, openingHourDayLabel, openingHourDayNumber, sortOpeningHours } from '../../utils/openingHours';

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
const validTimes = Array.from({ length: 24 }, (_, h) => {
  const hour12 = pad(h % 12 === 0 ? 12 : h % 12);
  const suffix = h < 12 ? 'AM' : 'PM';
  return [`${hour12}:00 ${suffix}`, `${hour12}:30 ${suffix}`];
}).flat();

interface OpeningHourProps {
  restaurantId: number;
  openingHours: OpeningHourType[];
  setOpeningHours: React.Dispatch<React.SetStateAction<OpeningHourType[]>>;
}

const emptyForm = (): OpeningHourType => ({
  day: 1,
  from_hour: '',
  to_hour: '',
  is_closed: false,
});

const errorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : 'Não foi possível guardar o horário.';

const OpeningHour: React.FC<OpeningHourProps> = ({ restaurantId, openingHours, setOpeningHours }) => {
  const [form, setForm] = useState<OpeningHourType>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (name: keyof OpeningHourType, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const handleSubmit = async () => {
    setError(null);
    const day = Number(form.day);
    if (!Number.isInteger(day) || day < 1 || day > 7) {
      setError('Selecione um dia.');
      return;
    }
    if (!form.is_closed && (!form.from_hour || !form.to_hour)) {
      setError('Selecione a hora de início e de término, ou marque como fechado.');
      return;
    }
    const payload: OpeningHourType = {
      day,
      from_hour: form.is_closed ? '' : form.from_hour,
      to_hour: form.is_closed ? '' : form.to_hour,
      is_closed: form.is_closed,
    };
    setSaving(true);
    try {
      if (editingId != null) {
        const updated = await updateOpeningHour(editingId, payload);
        setOpeningHours((prev) => sortOpeningHours(prev.map((h) => (h.id === editingId ? updated : h))));
      } else {
        const created = await createOpeningHour(restaurantId, payload);
        setOpeningHours((prev) => sortOpeningHours([...prev, created]));
      }
      resetForm();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (hour: OpeningHourType) => {
    if (hour.id == null) return;
    setError(null);
    setEditingId(hour.id);
    setForm({
      day: openingHourDayNumber(hour) || 1,
      from_hour: hour.from_hour ?? '',
      to_hour: hour.to_hour ?? '',
      is_closed: hour.is_closed,
    });
  };

  const removeHour = async (id: number) => {
    setError(null);
    try {
      await deleteOpeningHour(id);
      setOpeningHours((prev) => prev.filter((h) => h.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const confirmDelete = (hour: OpeningHourType) => {
    const id = hour.id;
    if (id == null) return;
    const question = `Remover ${openingHourDayLabel(hour)}?`;
    // Alert.alert is a no-op on react-native-web.
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(question)) void removeHour(id);
      return;
    }
    Alert.alert('Remover horário', question, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => void removeHour(id) },
    ]);
  };

  return (
    <View style={tailwind`mt-6`}>
      <Text style={tailwind`text-xl font-bold`}>Horário de Funcionamento</Text>
      <ScrollView style={tailwind`mt-2`}>
        {openingHours.length === 0 ? (
          <Text style={tailwind`text-gray-500`}>Nenhum horário definido. A loja aparece como aberta até adicionar horários.</Text>
        ) : (
          sortOpeningHours(openingHours).map((hour, index) => (
            <View key={hour.id ?? index} style={tailwind`flex flex-row items-center justify-between py-2 border-b border-gray-200`}>
              <View style={tailwind`flex-1`}>
                <Text style={tailwind`font-semibold`}>{openingHourDayLabel(hour)}</Text>
                <Text>{hour.is_closed ? 'Fechado' : `${hour.from_hour} - ${hour.to_hour}`}</Text>
              </View>
              <TouchableOpacity onPress={() => startEdit(hour)} style={tailwind`px-3 py-1`}>
                <Text style={tailwind`text-blue-600`}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(hour)} style={tailwind`px-3 py-1`}>
                <Text style={tailwind`text-red-600`}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      <View style={tailwind`mt-4`}>
        <Text style={tailwind`text-lg font-semibold`}>
          {editingId != null ? 'Editar Horário' : 'Adicionar Novo Horário'}
        </Text>
        <View>
          <View>
            <Text style={tailwind`text-sm font-medium`}>Dia</Text>
            <Picker
              selectedValue={Number(form.day)}
              onValueChange={(value) => handleChange('day', Number(value))}
              style={tailwind`mt-1 w-full p-2 border rounded-md`}
            >
              {WEEK_DAYS_PT.map((label, index) => (
                <Picker.Item key={label} label={label} value={index + 1} />
              ))}
            </Picker>
          </View>
          {!form.is_closed && (
            <>
              <View>
                <Text style={tailwind`text-sm font-medium`}>Hora de Início</Text>
                <Picker
                  selectedValue={form.from_hour}
                  onValueChange={(value) => handleChange('from_hour', String(value))}
                  style={tailwind`mt-1 w-full p-2 border rounded-md`}
                >
                  <Picker.Item label="Selecione uma hora" value="" />
                  {validTimes.map((time) => (
                    <Picker.Item key={time} label={time} value={time} />
                  ))}
                </Picker>
              </View>
              <View>
                <Text style={tailwind`text-sm font-medium`}>Hora de Término</Text>
                <Picker
                  selectedValue={form.to_hour}
                  onValueChange={(value) => handleChange('to_hour', String(value))}
                  style={tailwind`mt-1 w-full p-2 border rounded-md`}
                >
                  <Picker.Item label="Selecione uma hora" value="" />
                  {validTimes.map((time) => (
                    <Picker.Item key={time} label={time} value={time} />
                  ))}
                </Picker>
              </View>
            </>
          )}
          <View style={tailwind`flex flex-row items-center mt-2`}>
            <Checkbox value={form.is_closed} onValueChange={(value) => handleChange('is_closed', value)} />
            <Text style={tailwind`text-sm font-medium ml-2`}>Fechado</Text>
          </View>
          {error ? <Text style={tailwind`text-red-600 mt-2`}>{error}</Text> : null}
          <View style={tailwind`flex flex-row mt-2`}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              style={tailwind`px-4 py-2 rounded-md ${saving ? 'bg-blue-300' : 'bg-blue-500'}`}
            >
              <Text style={tailwind`text-white`}>
                {saving ? 'A guardar...' : editingId != null ? 'Guardar' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
            {editingId != null && (
              <TouchableOpacity onPress={resetForm} style={tailwind`ml-2 px-4 py-2 rounded-md bg-gray-300`}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default OpeningHour;
