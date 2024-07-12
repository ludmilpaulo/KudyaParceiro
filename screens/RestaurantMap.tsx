import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Linking, Image, ActivityIndicator, Modal, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { UserOrder } from '../services/ordertypes';
import { calculateDistance } from '../utils/distance';
import { baseAPI } from '../services/types';
import { fetchOngoingOrder, verifyOrder } from '../services/driverService';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';

type RootStackParamList = {
  RestaurantMap: { order: UserOrder } | undefined;
};

const RestaurantMap = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'RestaurantMap'>>();
  const navigation = useNavigation<any>();
  const user = useSelector(selectUser);
  const [order, setOrder] = useState<UserOrder | null>(route.params?.order || null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [verifiedItems, setVerifiedItems] = useState<boolean[]>([]);

  useEffect(() => {
    const checkOngoingOrder = async () => {
      try {
        const result = await fetchOngoingOrder(user.token);
        if (result.status === "success" && result.order) {
          setOrder(result.order);
        }
      } catch (error) {
        console.error("Failed to fetch ongoing order:", error);
      }
    };

    if (!order) {
      checkOngoingOrder();
    }
  }, [order, user.token]);

  useEffect(() => {
    if (order && order.order_details) {
      setVerifiedItems(order.order_details.map(() => false));
    }
  }, [order]);

  if (!order || !order.restaurant || !order.restaurant.location) {
    Alert.alert("Erro", "Detalhes do pedido ou localização do restaurante não encontrados.");
    navigation.goBack();
    return null;
  }

  const locationParts = order.restaurant.location ? order.restaurant.location.split(',').map(Number) : [0, 0];
  const latitude = locationParts[0];
  const longitude = locationParts[1];

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão de localização não concedida');
          setLoading(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);

        if (latitude && longitude) {
          const distanceToRestaurant = calculateDistance(
            { latitude: location.coords.latitude, longitude: location.coords.longitude },
            { latitude, longitude }
          );
          setDistance(distanceToRestaurant);

          const averageSpeedKmh = 50; // Average speed in km/h
          const timeInHours = distanceToRestaurant / averageSpeedKmh;
          const timeInMinutes = timeInHours * 60;
          setEstimatedTime(timeInMinutes);
        }
      } catch (error) {
        console.error("Erro ao obter localização atual:", error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentLocation();
  }, [latitude, longitude]);

  const handleNavigateBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleVerifyOrder = () => {
    setModalVisible(true);
  };

  const handleVerifyItem = (index: number) => {
    setVerifiedItems((prev) => {
      const newVerifiedItems = [...prev];
      newVerifiedItems[index] = !newVerifiedItems[index];
      return newVerifiedItems;
    });
  };

  const handleSubmitVerification = async () => {
    if (verifiedItems.every(item => item)) {
      try {
        const response = await verifyOrder({
          access_token: user.token,
          order_id: order.id,
          pin: order.secret_pin,
          received_items: verifiedItems,
        });

        if (response.status === "success") {
          Alert.alert("Sucesso", response.message);
          setModalVisible(false);
          // Navigate to CustomerDelivery screen
          navigation.navigate("CustomerDelivery", { order });
        } else {
          Alert.alert("Erro", response.message);
        }
      } catch (error) {
        Alert.alert("Erro", "Failed to verify order.");
      }
    } else {
      Alert.alert("Erro", "Certifique-se de que todos os itens foram verificados.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={order.restaurant.name}
          description={order.restaurant.address}
        >
          <Image source={{ uri: `${baseAPI}${order.restaurant.logo}` }} style={styles.markerImage} />
        </Marker>
      </MapView>
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{order.restaurant.name}</Text>
        <Text style={styles.address}>{order.restaurant.address}</Text>
        {distance !== null && (
          <>
            <Text style={styles.distance}>Distância: {distance.toFixed(2)} km</Text>
            <Text style={styles.estimatedTime}>Tempo estimado: {estimatedTime?.toFixed(0)} minutos</Text>
          </>
        )}
        <TouchableOpacity style={styles.directionsButton} onPress={openGoogleMaps}>
          <Text style={styles.buttonText}>Obter direções no Google Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleVerifyOrder}>
          <Text style={styles.buttonText}>Confira o Pedido</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verificar Pedido</Text>
            <ScrollView style={styles.modalScroll}>
              {order.order_details?.map((item, index) => (
                <View key={item.id} style={styles.modalItem}>
                  <Text style={styles.modalItemText}>{item.meal.name} - {item.quantity}x</Text>
                  <TouchableOpacity
                    style={[styles.verifyButton, verifiedItems[index] && styles.verifiedButton]}
                    onPress={() => handleVerifyItem(index)}
                  >
                    <Text style={styles.verifyButtonText}>{verifiedItems[index] ? "Verificado" : "Verificar"}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitVerification}>
                <Text style={styles.submitButtonText}>Enviar Verificação</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 16,
    marginVertical: 8,
  },
  distance: {
    fontSize: 16,
    marginVertical: 8,
  },
  estimatedTime: {
    fontSize: 16,
    marginVertical: 8,
  },
  directionsButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#007bff',
    alignItems: 'center',
    marginVertical: 8,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#06C167',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalScroll: {
    width: '100%',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalItemText: {
    fontSize: 16,
  },
  verifyButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  verifiedButton: {
    backgroundColor: '#06C167',
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 10,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RestaurantMap;
