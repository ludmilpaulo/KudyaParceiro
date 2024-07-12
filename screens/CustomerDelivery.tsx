import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Linking, Image, ActivityIndicator, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute, useNavigation } from '@react-navigation/native';
import { UserOrder } from '../services/ordertypes';
import { calculateDistance } from '../utils/distance';
import { baseAPI } from '../services/types';
import { fetchVerifiedOrder } from '../services/driverService';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import ChatComponent from '../components/ChatComponent'; // Adjust the import path accordingly
import { Avatar, Button, Modal as PaperModal, Portal, Provider } from 'react-native-paper';

const CustomerDelivery = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const [order, setOrder] = useState<UserOrder | null>(route.params?.order || null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatVisible, setChatVisible] = useState(false);

  useEffect(() => {
    const checkVerifiedOrder = async () => {
      try {
        const result = await fetchVerifiedOrder(user.token);
        if (result.status === "success" && result.order) {
          setOrder(result.order);
        }
      } catch (error) {
        console.error("Failed to fetch verified order:", error);
      }
    };

    if (!order) {
      checkVerifiedOrder();
    }
  }, [order, user.token]);

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

        const customerLocation = order?.customer.location;
        const orderLocation = order?.address;

        const locationToUse = orderLocation || customerLocation;

        if (locationToUse) {
          const locationParts = locationToUse.split(',').map(Number);
          if (locationParts.length === 2) {
            const [latitude, longitude] = locationParts;
            const distanceToCustomer = calculateDistance(
              { latitude: location.coords.latitude, longitude: location.coords.longitude },
              { latitude, longitude }
            );
            setDistance(distanceToCustomer);

            const averageSpeedKmh = 50; // Average speed in km/h
            const timeInHours = distanceToCustomer / averageSpeedKmh;
            const timeInMinutes = timeInHours * 60;
            setEstimatedTime(timeInMinutes);
          } else {
            Alert.alert("Erro", "Endereço do cliente inválido.");
          }
        }
      } catch (error) {
        console.error("Erro ao obter localização atual:", error);
      } finally {
        setLoading(false);
      }
    };

    if (order) {
      getCurrentLocation();
    }
  }, [order]);

  if (!order) {
    Alert.alert("Erro", "Detalhes do pedido não encontrados.");
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
    return null;
  }

  const locationToUse = order.address || order.customer.location;
  const locationParts = locationToUse.split(',').map(Number);
  const latitude = locationParts[0];
  const longitude = locationParts[1];

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const openChat = () => {
    setChatVisible(true);
  };

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Provider>
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
            title="Cliente"
            description={order.address || order.customer.address}
          />
        </MapView>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Entregar para</Text>
          <View style={styles.customerInfo}>
            <Avatar.Image size={50} source={{ uri: `${baseAPI}${order.customer.avatar}` }} style={styles.avatar} />
            <View>
              <Text style={styles.customerName}>{order.customer.name}</Text>
              <TouchableOpacity onPress={() => makeCall(order.customer.phone)}>
                <Text style={styles.phone}>{order.customer.phone}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.address}>{order.address || order.customer.address}</Text>
          {distance !== null && (
            <>
              <Text style={styles.distance}>Distância: {distance.toFixed(2)} km</Text>
              <Text style={styles.estimatedTime}>Tempo estimado: {estimatedTime?.toFixed(0)} minutos</Text>
            </>
          )}
          <Button mode="contained" onPress={openGoogleMaps} style={styles.directionsButton}>
            Obter direções no Google Maps
          </Button>
          <Button mode="contained" onPress={() => Alert.alert("Pedido entregue", "O pedido foi entregue ao cliente.")} style={styles.completeButton}>
            Completar Entrega
          </Button>
          <Button mode="contained" onPress={openChat} style={styles.chatButton}>
            Chat com Cliente
          </Button>
        </View>
        <Portal>
          <PaperModal visible={chatVisible} onDismiss={() => setChatVisible(false)} contentContainerStyle={styles.chatModalContent}>
            <ChatComponent
              user="driver"
              accessToken={user.token}
              orderId={order.id}
              userData={user}
            />
            <Button onPress={() => setChatVisible(false)} style={styles.closeButton}>
              Fechar Chat
            </Button>
          </PaperModal>
        </Portal>
      </View>
    </Provider>
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
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  avatar: {
    marginRight: 16,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
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
    marginVertical: 8,
  },
  completeButton: {
    marginVertical: 8,
  },
  chatButton: {
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatModalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    marginTop: 20,
  },
});

export default CustomerDelivery;
