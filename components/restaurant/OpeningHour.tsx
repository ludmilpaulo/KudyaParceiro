import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import tailwind from 'twrnc';
import { OpeningHourType } from '../../services/types';
import { createOpeningHour } from '../../services/apiService';

const validTimes = Array.from({ length: 24 }, (_, h) =>
  [`${h % 12 === 0 ? 12 : h % 12 < 10 ? `0${h % 12}` : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`, `${h % 12 === 0 ? 12 : h % 12 < 10 ? `0${h % 12}` : h % 12}:30 ${h < 12 ? 'AM' : 'PM'}`]
).flat();

interface OpeningHourProps {
  restaurantId: number;
  openingHours: OpeningHourType[];
  setOpeningHours: React.Dispatch<React.SetStateAction<OpeningHourType[]>>;
}

const OpeningHour: React.FC<OpeningHourProps> = ({ restaurantId, openingHours, setOpeningHours }) => {
  const [newOpeningHour, setNewOpeningHour] = useState<OpeningHourType>({
    restaurant: restaurantId,
    day: 1,
    from_hour: '',
    to_hour: '',
    is_closed: false,
  });
 

  const handleNewOpeningHourChange = (name: string, value: any) => {
    setNewOpeningHour((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOpeningHour = async () => {
    try {
      const newHour = await createOpeningHour(restaurantId, newOpeningHour);
      setOpeningHours([...openingHours, newHour]);
      setNewOpeningHour({
        restaurant: restaurantId,
        day: 1,
        from_hour: '',
        to_hour: '',
        is_closed: false,
      });
    } catch (error) {
      console.error('Error adding opening hour', error);
    }
  };

  return (
    <View style={tailwind`mt-6`}>
      <Text style={tailwind`text-xl font-bold`}>Horário de Funcionamento</Text>
      <ScrollView style={tailwind`mt-2`}>
        {openingHours.map((hour, index) => (
          <View key={index} style={tailwind`flex flex-row justify-between`}>
            <Text>{['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][hour.day]}</Text>
            <Text>{hour.is_closed ? 'Fechado' : `${hour.from_hour} - ${hour.to_hour}`}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={tailwind`mt-4`}>
        <Text style={tailwind`text-lg font-semibold`}>Adicionar Novo Horário</Text>
        <View style={tailwind`space-y-2`}>
          <View>
            <Text style={tailwind`block text-sm font-medium`}>Dia</Text>
            <Picker
              selectedValue={newOpeningHour.day}
              onValueChange={(value) => handleNewOpeningHourChange('day', value)}
              style={tailwind`mt-1 block w-full p-2 border rounded-md`}
            >
              <Picker.Item label="Selecione um dia" value="" />
              <Picker.Item label="Segunda-feira" value="1" />
              <Picker.Item label="Terça-feira" value="2" />
              <Picker.Item label="Quarta-feira" value="3" />
              <Picker.Item label="Quinta-feira" value="4" />
              <Picker.Item label="Sexta-feira" value="5" />
              <Picker.Item label="Sábado" value="6" />
              <Picker.Item label="Domingo" value="7" />
            </Picker>
          </View>
          <View>
            <Text style={tailwind`block text-sm font-medium`}>Hora de Início</Text>
            <Picker
              selectedValue={newOpeningHour.from_hour}
              onValueChange={(value) => handleNewOpeningHourChange('from_hour', value)}
              style={tailwind`mt-1 block w-full p-2 border rounded-md`}
            >
              <Picker.Item label="Selecione uma hora" value="" />
              {validTimes.map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
            </Picker>
          </View>
          <View>
            <Text style={tailwind`block text-sm font-medium`}>Hora de Término</Text>
            <Picker
              selectedValue={newOpeningHour.to_hour}
              onValueChange={(value) => handleNewOpeningHourChange('to_hour', value)}
              style={tailwind`mt-1 block w-full p-2 border rounded-md`}
            >
              <Picker.Item label="Selecione uma hora" value="" />
              {validTimes.map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
            </Picker>
          </View>
          <View style={tailwind`flex flex-row items-center space-x-2`}>
            <Checkbox
              value={newOpeningHour.is_closed}
              onValueChange={(value) => handleNewOpeningHourChange('is_closed', value)}
            />
            <Text style={tailwind`text-sm font-medium`}>Fechado</Text>
          </View>
          <TouchableOpacity
            onPress={handleAddOpeningHour}
            style={tailwind`mt-2 px-4 py-2 bg-blue-500 text-white rounded-md`}
          >
            <Text style={tailwind`text-white`}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OpeningHour;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
