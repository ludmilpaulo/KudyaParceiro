import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import tailwind from 'twrnc';
import { selectUser } from '../redux/slices/authSlice';
import { getRestaurant, getOpeningHours } from '../services/apiService';
import { RestaurantType, OpeningHourType } from '../services/types';

import OpeningHour from './OpeningHour';
import OpeningHoursCalendar from './OpeningHoursCalendar';
import RestaurantProfile from './RestaurantProfile';

const Profile: React.FC = () => {
  const user = useSelector(selectUser);
  const [restaurant, setRestaurant] = useState<RestaurantType | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHourType[]>([]);
  const [activeTab, setActiveTab] = useState<string>('perfil');
  

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (user?.user_id) {
        try {
          const data = await getRestaurant(user.user_id);
          setRestaurant(data);
          const openingHoursData = await getOpeningHours(data.id);
          setOpeningHours(openingHoursData);
        } catch (error) {
          console.error('Error fetching restaurant data', error);
        }
      }
    };
    fetchRestaurant();
  }, [user]);

  if (!restaurant) {
    return (
      <View style={tailwind`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={tailwind`p-6 bg-white rounded-lg shadow-md`}>
      <View style={tailwind`flex flex-row justify-around border-b mb-4`}>
        <TouchableOpacity
          style={tailwind`py-2 px-4 ${activeTab === 'perfil' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onPress={() => setActiveTab('perfil')}
        >
          <Text>Perfil do Restaurante</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tailwind`py-2 px-4 ${activeTab === 'horario' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onPress={() => setActiveTab('horario')}
        >
          <Text>Horário de Funcionamento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tailwind`py-2 px-4 ${activeTab === 'calendario' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onPress={() => setActiveTab('calendario')}
        >
          <Text>Calendário</Text>
        </TouchableOpacity>
      </View>
      <View>
        {activeTab === 'perfil' && (
          <RestaurantProfile restaurant={restaurant} setRestaurant={setRestaurant} />
        )}
        {activeTab === 'horario' && (
          <OpeningHour restaurantId={restaurant.id} openingHours={openingHours} setOpeningHours={setOpeningHours} />
        )}
        {activeTab === 'calendario' && (
          <OpeningHoursCalendar restaurantId={restaurant.id} />
        )}
      </View>
    </View>
  );
};

export default Profile;
