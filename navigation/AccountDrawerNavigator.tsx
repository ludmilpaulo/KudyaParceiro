import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileScreen from '../components/driver/ProfileScreen';
import RevenueScreen from '../components/driver/RevenueScreen';
import OrderHistoryScreen from '../components/driver/OrderHistoryScreen';
import { Ionicons } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();

const AccountDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        drawerIcon: ({ color, size }) => {
          let iconName: string = 'default-icon'; // Provide a default value
          if (route.name === 'Perfil') {
            iconName = 'person';
          } else if (route.name === 'Receitas') {
            iconName = 'cash';
          } else if (route.name === 'Histórico de Pedidos') {
            iconName = 'list';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        drawerActiveTintColor: 'tomato',
        drawerInactiveTintColor: 'gray',
      })}
    >
      <Drawer.Screen name="Perfil" component={ProfileScreen} />
      <Drawer.Screen name="Receitas" component={RevenueScreen} />
      <Drawer.Screen name="Histórico de Pedidos" component={OrderHistoryScreen} />
    </Drawer.Navigator>
  );
};

export default AccountDrawerNavigator;
