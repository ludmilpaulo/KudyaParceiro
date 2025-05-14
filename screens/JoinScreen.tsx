import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import tailwind from 'tailwind-react-native-classnames';

import type { AboutUsData, RestaurantJoin } from '../services/types';
import { baseAPI } from '../services/types';

import Banner from '../components/Banner';
import { fetchAboutUsData } from '../services/information';

const fallbackLocation = {
  latitude: -25.747868,
  longitude: 28.229271,
};

const JoinScreen = () => {
  const [headerData, setHeaderData] = useState<AboutUsData | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantJoin[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>(fallbackLocation);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationAndData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
    
        if (status !== 'granted') {
          Alert.alert('Location Permission Denied', 'Using default location.');
          setUserLocation(fallbackLocation);
        } else {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          } catch (locErr) {
            console.warn('Location error:', locErr);
            Alert.alert('Location Error', 'Could not get your location. Using default.');
            setUserLocation(fallbackLocation);
          }
        }
    
        const data = await fetchAboutUsData();
        setHeaderData(data); // because it's already an object, not an array

        console.log('Header data:', data);
    
        const response = await fetch(`${baseAPI}/customer/customer/restaurants/`);
        const restaurantData = await response.json();
        console.log('Restaurant data:', restaurantData);
    
        const approvedRestaurants = Array.isArray(restaurantData.restaurants)
          ? restaurantData.restaurants.map((restaurant: any) => ({
              ...restaurant,
              location: parseLocation(restaurant.location),
            }))
          : [];
    
        setRestaurants(approvedRestaurants);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Unable to fetch location or restaurant data.');
      } finally {
        setLoading(false);
      }
    };
    

    fetchLocationAndData();
  }, []);

  return (
    <View style={tailwind`flex-1 bg-gray-100`}>
     {loading ? (
  <View style={tailwind`flex-1 justify-center items-center`}>
    <ActivityIndicator size="large" color="#4f46e5" />
  </View>
) : headerData && restaurants.length > 0 ? (
  <Banner
    title={headerData.title}
    backgroundImage={headerData.backgroundImage}
    backgroundApp={headerData.backgroundApp}
    bottomImage={headerData.bottomImage}
    aboutText={headerData.about}
    restaurants={restaurants}
    userLocation={userLocation}
  />
) : (
  <View style={tailwind`flex-1 justify-center items-center`}>
    <Text style={tailwind`text-gray-600 text-lg`}>No data available</Text>
  </View>
)}

    </View>
  );
};

function parseLocation(locationString: string): { latitude: number; longitude: number } {
  if (!locationString || !locationString.includes(',')) {
    return fallbackLocation;
  }
  const [latitude, longitude] = locationString.split(',').map(Number);
  return {
    latitude: isNaN(latitude) ? fallbackLocation.latitude : latitude,
    longitude: isNaN(longitude) ? fallbackLocation.longitude : longitude,
  };
}

export default JoinScreen;
