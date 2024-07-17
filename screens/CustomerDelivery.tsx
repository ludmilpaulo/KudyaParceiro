import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Linking, ActivityIndicator, Modal, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { UserOrder } from '../services/ordertypes';
import { calculateDistance } from '../utils/distance';
import { baseAPI } from '../services/types';
import { fetchVerifiedOrder, updateDriverLocation } from '../services/driverService';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import ChatComponent from '../components/ChatComponent'; // Adjust the import path accordingly
import { Avatar, Button } from 'react-native-paper';
import axios from 'axios';

// Define the route params type
type RootStackParamList = {
  CustomerDelivery: { order: UserOrder };
};

type CustomerDeliveryRouteProp = RouteProp<RootStackParamList, 'CustomerDelivery'>;

const CustomerDelivery = () => {
  const route = useRoute<CustomerDeliveryRouteProp>();
  const navigation = useNavigation<any>();
  const user = useSelector(selectUser);
  const [order, setOrder] = useState<UserOrder | null>(route.params?.order || null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatVisible, setChatVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    const checkVerifiedOrder = async () => {
      try {
        console.log("Fetching verified order for user:", user);
        const result = await fetchVerifiedOrder(user.token);
        console.log("Verified order fetched:", result);
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
        console.log("Current location obtained:", location);
        setCurrentLocation(location);

        const customerLocation = order?.customer.location;
        const orderLocation = order?.address;

        const locationToUse = orderLocation || customerLocation;

        if (locationToUse) {
          const locationParts = locationToUse.split(',').map(Number);
          console.log("Location parts:", locationParts);
          if (locationParts.length === 2) {
            const [latitude, longitude] = locationParts;
            const distanceToCustomer = calculateDistance(
              { latitude: location.coords.latitude, longitude: location.coords.longitude },
              { latitude, longitude }
            );
            console.log("Distance to customer:", distanceToCustomer);
            setDistance(distanceToCustomer);

            const averageSpeedKmh = 50; // Average speed in km/h
            const timeInHours = distanceToCustomer / averageSpeedKmh;
            const timeInMinutes = timeInHours * 60;
            console.log("Estimated time to customer:", timeInMinutes);
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

  const locationToUse = order.address || order.customer.location || '';
  const locationParts = locationToUse.split(',').map(Number);
  const latitude = locationParts.length === 2 ? locationParts[0] : null;
  const longitude = locationParts.length === 2 ? locationParts[1] : null;

  console.log("Order location:", locationToUse);
  console.log("Parsed latitude:", latitude);
  console.log("Parsed longitude:", longitude);

  const openGoogleMaps = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert("Erro", "Coordenadas de localização inválidas.");
    }
  };

  const openChat = () => {
    console.log("Opening chat modal");
    setChatVisible(true);
  };

  const closeChat = () => {
    console.log("Closing chat modal");
    setChatVisible(false);
  };

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleCompleteDelivery = () => {
    setPinModalVisible(true);
  };

  const submitPin = async () => {
    try {
      const response = await axios.post(`${baseAPI}/driver/order/complete/`, {
        access_token: user.token,
        order_id: order?.id,
        secret_pin: pin,
      });
      if (response.data.status === 'success') {
        Alert.alert("Pedido entregue", "O pedido foi entregue ao cliente.");
        setPinModalVisible(false);
        navigation.navigate("EntregadorDashboard");
      } else {
        Alert.alert("Erro", "PIN incorreto. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao completar pedido:", error);
      Alert.alert("Erro", "Não foi possível completar o pedido. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const updateLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      await updateDriverLocation(user?.user_id, user?.token, currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
      console.error("Erro ao atualizar localização do motorista:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude || 0,
          longitude: longitude || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {latitude && longitude && (
          <Marker
            coordinate={{ latitude, longitude }}
            title="Cliente"
            description={order.address || order.customer.address}
          >
            <View>
              <Text>{order.address || order.customer.address}</Text>
            </View>
          </Marker>
        )}
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
        <Button mode="contained" onPress={handleCompleteDelivery} style={styles.completeButton}>
          Completar Entrega
        </Button>
        <Button mode="contained" onPress={openChat} style={styles.chatButton}>
          Chat com Cliente
        </Button>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={chatVisible}
        onRequestClose={closeChat}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ChatComponent
              user="driver"
              accessToken={user.token}
              orderId={order.id.toString()} // Convert order.id to string here
              userData={user}
            />
            <Button onPress={closeChat} style={styles.closeButton}>
              Fechar Chat
            </Button>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={pinModalVisible}
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.pinPrompt}>Insira o PIN secreto para completar a entrega:</Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              placeholder="PIN Secreto"
              secureTextEntry
            />
            <Button mode="contained" onPress={submitPin} style={styles.submitPinButton}>
              Enviar PIN
            </Button>
            <Button onPress={() => setPinModalVisible(false)} style={styles.closeButton}>
              Cancelar
            </Button>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 20,
  },
  closeButton: {
    marginTop: 20,
  },
  pinPrompt: {
    fontSize: 18,
    marginBottom: 10,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  submitPinButton: {
    marginBottom: 10,
  },
});

export default CustomerDelivery;
