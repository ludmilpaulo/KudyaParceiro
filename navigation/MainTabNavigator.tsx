import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import EntregadorDashboard from "../screens/EntregadorDashboard";
import UserProfile from "../screens/UserProfile";
import RestaurantMap from "../screens/RestaurantMap";
import CustomerDelivery from "../screens/CustomerDelivery";
import AccountScreen from "../screens/AccountScreen";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#000",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 25,
          height: 75,
        },
      }}
      tabBar={(props: any) => (
        <View style={styles.tabBarContainer}>
          <LinearGradient
            colors={["#FCD34D", "#3B82F6"]}
            style={styles.gradient}
          >
            <BottomTabBar {...props} style={styles.tabBar} />
          </LinearGradient>
        </View>
      )}
    >
      <Tab.Screen
        name="Home"
        component={EntregadorDashboard}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <AntDesign name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Acompanhar"
        component={RestaurantMap}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="car" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Levar Pao client"
        component={CustomerDelivery}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Feather name="shopping-bag" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Conta"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Feather name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    height: 75,
  },
  tabBar: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 6,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default MainTabNavigator;