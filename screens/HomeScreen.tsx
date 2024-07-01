import { SafeAreaView, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import React, { useEffect, useState } from "react";
import { getOrder } from "../configs/variable";
import {
  Order,
  Customer,
  Restaurant,
  OrderDetail,
  UserOrder,
} from "../configs/types";
import OrdersItem from "../components/OrdersItem";

import * as Notifications from 'expo-notifications';
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const HomeScreen = () => {
  const [userOrder, setUserOrder] = useState<UserOrder[]>([]);
  const [customerOrder, setCustomerOrder] = useState<Customer | undefined>();
  const [restaurantOrder, setRestaurantOrder] = useState<
    Restaurant | undefined
  >();
  const [orderDetails, setOrderDetails] = useState<OrderDetail[] | undefined>();
  const [orderTotal, setOrderTotal] = useState<number | undefined>();
  const [orderStatus, setOrderStatus] = useState<string | undefined>();
  const [orderAddress, setOrderAddress] = useState<string | undefined>();

  const [loading, setLoading] = useState(false);

  const [ vibrar, setVibrar ] = useState<UserOrder[]>([])

  const user = useSelector(selectUser);

  const navigation = useNavigation<any>()


  const getUserData = async()=>{
    try{
     
  
      let response = await fetch('https://www.sunshinedeliver.com/api/driver/profile/', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user?.user_id
            
            })
        })
         .then((response) => response.json())
         .then((responseJson) => {
          if(responseJson.customer_detais.avatar == null){
            alert("Por favor, preencha seus dados");
            navigation.navigate("UserProfile");
          };
          })  
        }catch (e) {
          
            alert(e)
           
          }
   }  

      

      const DURATION = 2000;

  useEffect(() => {
  getUserData();
    const fetchDataFromOrderEndpoint = async () => {
      try {
        const { orders }: { orders: UserOrder[] } = await getOrder(
          "/api/driver/orders/ready/",
        );

        if (orders.length > 0) {
          setUserOrder(orders);
          setVibrar(orders) ;
          orders.forEach((order: UserOrder) => {
            const {
              customer,
              restaurant,
              order_details,
              total,
              status,
              address,
            } = order;

            setCustomerOrder(customer);
            setRestaurantOrder(restaurant);
            setOrderDetails(order_details);
            setOrderTotal(total);
            setOrderStatus(status);
            setOrderAddress(address);

            // Call orderNotification after setting state
            orderNotification();

          });
        } else {
        }
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

  const fetchDataInterval = 30000; // 30 seconds
const orderNotificationInterval = 30000; // 30 seconds

const fetchDataIntervalId = setInterval(() => {
  fetchDataFromOrderEndpoint();
}, fetchDataInterval);

const orderNotificationIntervalId = setInterval(() => {
  orderNotification();
}, orderNotificationInterval);

return () => {
  // Clear both intervals before component unmounts
  clearInterval(fetchDataIntervalId);
  clearInterval(orderNotificationIntervalId);
};
  }, []); 

  const orderNotification = async () => {
    try {
      // Check if there are new orders to trigger vibration
      if (vibrar.length > 0) {
        Vibration.vibrate(DURATION);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  }; 

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <OrdersItem orderReady={userOrder} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;