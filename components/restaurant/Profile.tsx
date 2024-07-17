import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import tailwind from 'twrnc';
import { selectUser } from '../../redux/slices/authSlice';
import { getRestaurant, getOpeningHours } from '../../services/apiService';
import { RestaurantType, OpeningHourType } from '../../services/types';

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
      <View style={tailwind`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={tailwind`text-blue-500 mt-4`}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tailwind`flex-1 bg-gray-100`}>
      <View style={tailwind`p-6 bg-white rounded-lg shadow-md m-4`}>
        <View style={tailwind`flex flex-row justify-around border-b mb-4`}>
          <TouchableOpacity
            style={tailwind`flex-1 py-2 px-4 items-center ${activeTab === 'perfil' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
            onPress={() => setActiveTab('perfil')}
          >
            <Text style={tailwind`text-lg font-semibold`}>Perfil </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tailwind`flex-1 py-2 px-4 items-center ${activeTab === 'horario' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
            onPress={() => setActiveTab('horario')}
          >
            <Text style={tailwind`text-lg font-semibold`}>Horário </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tailwind`flex-1 py-2 px-4 items-center ${activeTab === 'calendario' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
            onPress={() => setActiveTab('calendario')}
          >
            <Text style={tailwind`text-lg font-semibold`}>Calendário</Text>
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
    </ScrollView>
  );
};

export default Profile;
