import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GroceryHomeScreen from '../screens/grocery/GroceryHomeScreen';
import GroceryOrdersScreen from '../screens/grocery/GroceryOrdersScreen';
import GroceryProductsScreen from '../screens/grocery/GroceryProductsScreen';
import GroceryInventoryScreen from '../screens/grocery/GroceryInventoryScreen';
import GroceryMoreScreen from '../screens/grocery/GroceryMoreScreen';
import GroceryAddProductScreen from '../screens/grocery/GroceryAddProductScreen';
import {
  GroceryProfileScreen,
  GroceryPromotionsScreen,
  GroceryRevenueScreen,
  GrocerySalesScreen,
  GrocerySupportScreen,
} from '../screens/grocery/GroceryMoreScreens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function GroceryTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#059669' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: 'grid-outline',
            Orders: 'receipt-outline',
            Products: 'pricetag-outline',
            Inventory: 'cube-outline',
            More: 'ellipsis-horizontal',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={GroceryHomeScreen} />
      <Tab.Screen name="Orders" component={GroceryOrdersScreen} />
      <Tab.Screen name="Products" component={GroceryProductsScreen} />
      <Tab.Screen name="Inventory" component={GroceryInventoryScreen} />
      <Tab.Screen name="More" component={GroceryMoreScreen} />
    </Tab.Navigator>
  );
}

const stackHeader = { headerStyle: { backgroundColor: '#059669' }, headerTintColor: '#fff' };

export default function GroceryTabNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="GroceryTabs" component={GroceryTabs} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryAddProduct" component={GroceryAddProductScreen} options={{ title: 'Add Product', ...stackHeader }} />
      <Stack.Screen name="GrocerySales" component={GrocerySalesScreen} options={{ title: 'Sales', ...stackHeader }} />
      <Stack.Screen name="GroceryRevenue" component={GroceryRevenueScreen} options={{ title: 'Revenue', ...stackHeader }} />
      <Stack.Screen name="GroceryPromotions" component={GroceryPromotionsScreen} options={{ title: 'Promotions', ...stackHeader }} />
      <Stack.Screen name="GroceryProfile" component={GroceryProfileScreen} options={{ title: 'Store Profile', ...stackHeader }} />
      <Stack.Screen name="GrocerySupport" component={GrocerySupportScreen} options={{ title: 'Help & Support', ...stackHeader }} />
    </Stack.Navigator>
  );
}
