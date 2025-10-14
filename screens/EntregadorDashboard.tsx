import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, Vibration, View, ActivityIndicator, Switch, Alert } from "react-native";
import OrdersItem from "../components/OrdersItem";
import * as Notifications from 'expo-notifications';
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, logoutUser } from "../redux/slices/authSlice";
import { getDriverProfile, getDriverOrders, updateDriverLocation, fetchOngoingOrder, fetchVerifiedOrder } from "../services/driverService";
import { UserOrder } from "../services/ordertypes";
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import { calculateDistance } from "../utils/distance";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const EntregadorDashboard = () => {
  const [userOrder, setUserOrder] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchDataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const user = useSelector(selectUser);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const sound = useRef<Audio.Sound | null>(null);

  const routes = useNavigationState(state => state.routes);

  const getUserData = async () => {
    try {
      const profile = await getDriverProfile(user?.user_id, dispatch);
      if (profile.customer_detais.avatar == null) {
        alert("Por favor, preencha seus dados");
        navigation.navigate("UserProfile");
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Ocorreu um erro desconhecido");
      }
    }
  };

  const checkOngoingOrder = async () => {
    try {
      const verifiedOrderResult = await fetchVerifiedOrder(user?.token);
      if (verifiedOrderResult.status === "success" && verifiedOrderResult.order) {
        navigation.navigate("CustomerDelivery", { order: { ...verifiedOrderResult.order } });
        return;
      }

      const ongoingOrderResult = await fetchOngoingOrder(user?.token);
      if (ongoingOrderResult.status === "success" && ongoingOrderResult.order) {
        navigation.navigate("RestaurantMap", { order: { ...ongoingOrderResult.order } });
        return;
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchDataFromOrderEndpoint = async () => {
    console.log('Fetching data from order endpoint');
    try {
      const orders = await getDriverOrders(dispatch);
      console.log('Orders fetched:', orders);

      const filteredOrders = orders.filter(order => {
        const [latitude, longitude] = order.restaurant.location.split(',').map(Number);
        const orderLocation = { latitude, longitude };
        const distance = calculateDistance(location?.coords || { latitude: 0, longitude: 0 }, orderLocation);
        return distance <= 38;
      });

      console.log('Filtered orders:', filteredOrders);
      setUserOrder(filteredOrders);

      if (filteredOrders.length > 0 && !routes.some(route => route.name === "CustomerDelivery" || route.name === "RestaurantMap")) {
        Vibration.vibrate(2000); // Vibrate for 2 seconds
        await playSound();
        await sendPushNotification();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erro ao buscar dados do pedido:", error.message);
      } else {
        console.error("Erro desconhecido ao buscar dados do pedido");
      }
    }
  };

  const updateLocation = async () => {
    console.log('Updating location');
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      console.log('Current location:', currentLocation);
      setLocation(currentLocation);
      await updateDriverLocation(user?.user_id, user?.token, currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
      console.error("Erro ao atualizar localização do motorista:", error);
    }
  };

  const handleStatusChange = async (status: boolean) => {
    console.log(`Status changed to: ${status}`);
    setIsOnline(status);
    if (status) {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permissão de localização não concedida');
        setIsOnline(false);
        return;
      }
      locationIntervalRef.current = setInterval(updateLocation, 3000); // Update location every 3 seconds
      fetchDataIntervalRef.current = setInterval(fetchDataFromOrderEndpoint, 5000); // Fetch data every 5 seconds

      // Fetch data immediately
      console.log('Fetching data immediately after going online');
      await fetchDataFromOrderEndpoint();
    } else {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
      if (fetchDataIntervalRef.current) {
        clearInterval(fetchDataIntervalRef.current);
        fetchDataIntervalRef.current = null;
      }
    }
  };

  const playSound = async () => {
    try {
      const { sound: soundObject } = await Audio.Sound.createAsync(
        require('../assets/notification.mp3')
      );
      sound.current = soundObject;
      await sound.current.playAsync();
    } catch (error) {
      console.error("Erro ao tocar som de notificação:", error);
    }
  };

  const sendPushNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Novo Pedido",
        body: "Você tem novos pedidos prontos para retirada.",
      },
      trigger: null,
    });
  };

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId: 'f848ca4d-cf74-4e6b-b42d-107d533158b8' })).data;
    console.log(token);
  };

  useEffect(() => {
    registerForPushNotificationsAsync();
    getUserData();
    checkOngoingOrder();

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
      if (fetchDataIntervalRef.current) {
        clearInterval(fetchDataIntervalRef.current);
      }
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Online</Text>
        <Switch value={isOnline} onValueChange={handleStatusChange} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View style={styles.ordersContainer}>
            {userOrder.length > 0 ? (
              <OrdersItem orderReady={userOrder} />
            ) : (
              <Text style={styles.noOrdersText}>Nenhum pedido disponível</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statusText: {
    fontSize: 16,
  },
  scrollViewContent: {
    padding: 16,
  },
  ordersContainer: {
    marginTop: 16,
  },
  noOrdersText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
  },
});

export default EntregadorDashboard;
