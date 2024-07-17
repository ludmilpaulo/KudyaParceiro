import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
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
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);


  useEffect(() => {
    const fetchOpeningHours = async () => {
      try {
        const data = await getOpeningHours(restaurantId);
        setOpeningHours(data);
        const closedDays = data.filter(hour => hour.is_closed).map(hour => getDateFromDay(hour.day));
        setHighlightedDates(closedDays);
      } catch (error) {
        console.error("Error fetching opening hours", error);
      }
    };
    fetchOpeningHours();
  }, [restaurantId]);

  const getDateFromDay = (day: number): Date => {
    const now = new Date();
    const start = startOfWeek(now, { locale: ptBR });
    return addDays(start, day);
  };

  return (
    <View style={tailwind`mt-6`}>
      <Text style={tailwind`text-xl font-bold mb-4`}>Horário de Funcionamento</Text>
      <FlatList
        data={openingHours}
        keyExtractor={(item) => item.day.toString()}
        renderItem={({ item }) => (
          <View style={tailwind`flex flex-row justify-between p-2`}>
            <Text style={tailwind`text-base`}>{daysOfWeek[item.day]}</Text>
            <Text style={tailwind`text-base`}>{item.is_closed ? "Fechado" : `${item.from_hour} - ${item.to_hour}`}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: 'red',
    color: 'white',
  },
});

export default OpeningHoursCalendar;
