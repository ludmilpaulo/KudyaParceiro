import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem, type DrawerContentComponentProps } from '@react-navigation/drawer';
import type { ComponentProps } from 'react';
import ProfileScreen from '../components/driver/ProfileScreen';
import RevenueScreen from '../components/driver/RevenueScreen';
import OrderHistoryScreen from '../components/driver/OrderHistoryScreen';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { Alert } from 'react-native';

const Drawer = createDrawerNavigator();

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            dispatch(logoutUser());
          }
        }
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => (
          <Ionicons name="exit" size={size} color={color} />
        )}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
};

const AccountDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        drawerIcon: ({ color, size }) => {
          let iconName: IoniconName = 'help';
          if (route.name === 'Perfil') {
            iconName = 'person';
          } else if (route.name === 'Receitas') {
            iconName = 'cash';
          } else if (route.name === 'Histórico de Pedidos') {
            iconName = 'list';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
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
