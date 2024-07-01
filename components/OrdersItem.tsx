import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import tailwind from "tailwind-react-native-classnames";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UserOrder } from "../configs/types";
import { useNavigation } from "@react-navigation/native";

interface OrdersItemProps {
  orderReady: UserOrder[] | undefined;
}

const OrdersItem: React.FC<OrdersItemProps> = ({ orderReady }) => {
  const navigation = useNavigation<any>();
  const url = "https://www.sunshinedeliver.com";

  const handlePress = (order: UserOrder) => {
    console.log(order);
    navigation.navigate("RestaurantMap", {
      order: { ...order },
    });
  };

  return (
    <SafeAreaView>
      {orderReady?.map((order) => (
        <TouchableOpacity
          key={order.id}
          style={tailwind`mx-4 mb-4`}
          onPress={() => handlePress(order)}
        >
          <View
            style={tailwind`border-2 mt-12 border-gray-300 rounded overflow-hidden shadow-md`}
          >
            <View style={tailwind`flex-row justify-between`}>
              <View style={tailwind`p-4 flex-1`}>
                <Text style={tailwind`text-lg font-bold text-black pb-2`}>
                  {order.restaurant.name}
                </Text>
                <View style={tailwind`flex-row items-center`}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={13}
                    color="#06C167"
                  />
                  <Text style={tailwind`text-sm text-black opacity-50 pl-1`}>
                    {order.restaurant.phone}
                  </Text>
                </View>
              </View>
              <Image
                source={{ uri: `${url}${order.customer.avatar}` }}
                style={tailwind`h-20 w-20 m-4`}
              />
            </View>
            <View style={tailwind`p-4 flex-row`}>
              <Text style={tailwind`text-sm text-black opacity-90`}>
                {order.restaurant.address} {"\n"} {"\n"}
                {order.address}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
};

export default OrdersItem;