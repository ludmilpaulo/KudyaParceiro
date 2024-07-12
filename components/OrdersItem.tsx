import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserOrder } from "../services/ordertypes";
import { baseAPI } from "../services/types";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import { fetchOngoingOrder, acceptOrder, rejectOrder } from "../services/driverService";

interface OrdersItemProps {
  orderReady: UserOrder[] | undefined;
}

const OrdersItem: React.FC<OrdersItemProps> = ({ orderReady }) => {
  const navigation = useNavigation<any>();
  const url = baseAPI;
  const [rejectedCount, setRejectedCount] = useState(0);
  const [rejectedOrders, setRejectedOrders] = useState<number[]>([]);
  const [ongoingOrder, setOngoingOrder] = useState<UserOrder | null>(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchDriverOngoingOrder = async () => {
      try {
        const result = await fetchOngoingOrder(user?.token);
        if (result.status === "success" && result.order) {
          setOngoingOrder(result.order);
          navigation.navigate("RestaurantMap", { order: { ...result.order } });
        }
      } catch (error) {
        console.error("Failed to fetch ongoing order:", error);
      }
    };

    fetchDriverOngoingOrder();
  }, [user?.token, navigation]);

  const handleAccept = async (order: UserOrder) => {
    if (ongoingOrder) {
      Alert.alert(
        "Pedido em andamento",
        `Você já tem um pedido em andamento:
        Restaurante: ${ongoingOrder.restaurant.name}
        Endereço: ${ongoingOrder.restaurant.address}
        Cliente: ${ongoingOrder.customer.avatar ? ongoingOrder.customer.avatar : "N/A"}
        `
      );
      navigation.navigate("RestaurantMap", { order: { ...ongoingOrder } });
     // return;
    }

    try {
      const result = await acceptOrder(order.id, user?.token);
      if (result.status ==="success") {
        Alert.alert("Ótimo, por favor, você tem no máximo 20 minutos para concluir esta entrega");
        setOngoingOrder(order);
        navigation.navigate("RestaurantMap", { order: { ...order } });
      } else {
        Alert.alert("Erro", result.error || "Falha ao aceitar pedido.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao conectar ao servidor.");
    }
  };

  const handleReject = async (orderId: number) => {
    try {
      const result = await rejectOrder(orderId, user?.token);
      if (result.status === "success") {
        setRejectedCount(prevCount => {
          const newCount = prevCount + 1;
          if (newCount >= 10) {
            Alert.alert(
              "Aviso",
              "Você rejeitou mais de 10 pedidos. Você pode ser removido da plataforma se continuar a rejeitar pedidos."
            );
          }
          return newCount;
        });
        setRejectedOrders(prevOrders => [...prevOrders, orderId]);
      } else {
        Alert.alert("Erro", result.message || "Falha ao rejeitar pedido.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao conectar ao servidor.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {orderReady
          ?.filter((order) => !rejectedOrders.includes(order.id))
          .map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: `${url}${order.restaurant.logo}` }}
                  style={styles.logo}
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
                  <View style={styles.contactInfo}>
                    <MaterialCommunityIcons
                      name="phone"
                      size={13}
                      color="#06C167"
                    />
                    <Text style={styles.contactText}>{order.restaurant.phone}</Text>
                  </View>
                </View>
                <Image
                  source={{ uri: `${url}${order.customer.avatar}` }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.addressText}>{order.restaurant.address} {"\n"} {order.address}</Text>
              </View>
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.button, styles.acceptButton]}
                  onPress={() => handleAccept(order)}
                >
                  <Text style={styles.buttonText}>Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleReject(order.id)}
                >
                  <Text style={styles.buttonText}>Rejeitar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  scrollContainer: { padding: 16 },
  orderCard: { marginVertical: 8, borderRadius: 10, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5, elevation: 5, overflow: "hidden" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#f7f7f7" },
  cardInfo: { flex: 1, marginLeft: 10 },
  restaurantName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  contactInfo: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  contactText: { marginLeft: 4, fontSize: 14, color: "#555" },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  logo: { width: 60, height: 60, borderRadius: 30 },
  cardBody: { padding: 16 },
  addressText: { fontSize: 14, color: "#555" },
  cardFooter: { flexDirection: "row", justifyContent: "space-around", padding: 16, borderTopWidth: 1, borderTopColor: "#ddd" },
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  acceptButton: { backgroundColor: "#06C167" },
  rejectButton: { backgroundColor: "#ff3b30" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default OrdersItem;
