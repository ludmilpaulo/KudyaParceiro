import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import EntregadorDashboard from "../screens/EntregadorDashboard";
import RestaurantMap from "../screens/RestaurantMap";
import CustomerDelivery from "../screens/CustomerDelivery";
import AccountScreen from "../screens/AccountScreen";
import DriverTasksScreen from "../screens/DriverTasksScreen";
import { useTranslation } from "../hooks/useTranslation";
import { useDriverCapabilities } from "../hooks/useDriverCapabilities";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { t } = useTranslation();
  const { showFood, showTaxi, showParcel } = useDriverCapabilities();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.75)",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 25,
          height: 75,
          backgroundColor: 'transparent',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
      tabBar={(props: React.ComponentProps<typeof BottomTabBar>) => (
        <View style={styles.tabBarContainer}>
          <LinearGradient colors={["#0171CE", "#0359A8"]} style={styles.gradient}>
            <BottomTabBar {...props} style={styles.tabBar} />
          </LinearGradient>
        </View>
      )}
    >
      {showFood && (
        <Tab.Screen
          name="FoodDeliveries"
          component={EntregadorDashboard}
          options={{
            title: t('riderTabFood'),
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="home" color={color} size={size} />
            ),
          }}
        />
      )}
      {showTaxi && (
        <Tab.Screen
          name="TaxiRides"
          component={DriverTasksScreen}
          options={{
            title: t('riderTabTaxi'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="car-sport" color={color} size={size} />
            ),
          }}
        />
      )}
      {showParcel && (
        <Tab.Screen
          name="ParcelDeliveries"
          component={CustomerDelivery}
          options={{
            title: t('riderTabParcel'),
            tabBarIcon: ({ color, size }) => (
              <Feather name="package" color={color} size={size} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="ActiveTrip"
        component={RestaurantMap}
        options={{
          title: t('riderTabMap'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="navigate" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: t('riderTabAccount'),
          tabBarIcon: ({ color, size }) => (
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
});

export default MainTabNavigator;
