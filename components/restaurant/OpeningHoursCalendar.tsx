import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { OpeningHourType } from '../../services/types';
import { addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import tailwind from 'twrnc';
import { getOpeningHours } from '../../services/apiService';

interface OpeningHoursCalendarProps {
  restaurantId: number;
}

const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const OpeningHoursCalendar: React.FC<OpeningHoursCalendarProps> = ({ restaurantId }) => {
  const [openingHours, setOpeningHours] = useState<OpeningHourType[]>([]);

  useEffect(() => {
    const fetchOpeningHours = async () => {
      try {
        const data = await getOpeningHours(restaurantId);
        setOpeningHours(data);
      } catch (error) {
        console.error("Error fetching opening hours", error);
      }
    };
    fetchOpeningHours();
  }, [restaurantId]);

  return (
    <View style={tailwind`mt-6`}>
      <Text style={tailwind`text-xl font-bold mb-4`}>Horário de Funcionamento</Text>
      {openingHours.map((item, index) => (
        <View key={`${item.day}-${index}`} style={tailwind`flex flex-row justify-between p-2`}>
          <Text style={tailwind`text-base`}>{daysOfWeek[item.day]}</Text>
          <Text style={tailwind`text-base`}>
            {item.is_closed ? 'Fechado' : `${item.from_hour} - ${item.to_hour}`}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default OpeningHoursCalendar;
