import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { OpeningHourType } from '../../services/types';
import tailwind from 'twrnc';
import { getOpeningHours } from '../../services/apiService';
import { WEEK_DAYS_PT, openingHourDayNumber } from '../../utils/openingHours';

interface OpeningHoursCalendarProps {
  restaurantId: number;
}

const OpeningHoursCalendar: React.FC<OpeningHoursCalendarProps> = ({ restaurantId }) => {
  const [openingHours, setOpeningHours] = useState<OpeningHourType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchOpeningHours = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getOpeningHours(restaurantId);
        if (!cancelled) setOpeningHours(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar o horário.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOpeningHours();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const describeDay = (dayNumber: number) => {
    const rows = openingHours.filter((h) => openingHourDayNumber(h) === dayNumber);
    if (rows.length === 0) return 'Sem horário';
    if (rows.some((h) => h.is_closed)) return 'Fechado';
    return rows
      .map((h) => `${h.from_hour} - ${h.to_hour}`)
      .sort()
      .join(', ');
  };

  return (
    <View style={tailwind`mt-6`}>
      <Text style={tailwind`text-xl font-bold mb-4`}>Horário de Funcionamento</Text>
      {loading ? (
        <Text style={tailwind`text-gray-500`}>Carregando...</Text>
      ) : loadError ? (
        <Text style={tailwind`text-red-600`}>{loadError}</Text>
      ) : openingHours.length === 0 ? (
        <Text style={tailwind`text-gray-500`}>Nenhum horário definido.</Text>
      ) : (
        WEEK_DAYS_PT.map((label, index) => (
          <View key={label} style={tailwind`flex flex-row justify-between p-2`}>
            <Text style={tailwind`text-base`}>{label}</Text>
            <Text style={tailwind`text-base`}>{describeDay(index + 1)}</Text>
          </View>
        ))
      )}
    </View>
  );
};

export default OpeningHoursCalendar;
