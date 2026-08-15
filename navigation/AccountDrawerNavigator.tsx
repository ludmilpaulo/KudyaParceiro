import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem, type DrawerContentComponentProps } from '@react-navigation/drawer';
import type { ComponentProps } from 'react';
import ProfileScreen from '../components/driver/ProfileScreen';
import RevenueScreen from '../components/driver/RevenueScreen';
import OrderHistoryScreen from '../components/driver/OrderHistoryScreen';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../redux/slices/authSlice';
import { Alert, Linking } from 'react-native';
import axios from 'axios';
import { baseAPI } from '../services/types';

const PRIVACY_URL = 'https://sd-kudya.vercel.app/PrivacyPolicy';
const TERMS_URL = 'https://sd-kudya.vercel.app/TermsOfService';

const Drawer = createDrawerNavigator();

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = user?.access_token || user?.access || user?.token;

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

  const deleteAccount = async () => {
    if (!token) {
      Alert.alert('Error', 'You must be signed in to delete your account.');
      return;
    }
    try {
      await axios.post(
        `${baseAPI}/api/auth/deactivate/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      dispatch(logoutUser());
      Alert.alert(
        'Account deleted',
        'Your Kudya Parceiro account has been deleted.',
      );
    } catch {
      Alert.alert(
        'Error',
        'Could not delete your account. Please try again or contact support@kudya.store.',
      );
    }
  };

  const requestAccountDeletion = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your Kudya Parceiro account and associated personal data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => {
            void deleteAccount();
          },
        },
      ],
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Privacy Policy"
        icon={({ color, size }) => (
          <Ionicons name="shield-checkmark" size={size} color={color} />
        )}
        onPress={() => void Linking.openURL(PRIVACY_URL)}
      />
      <DrawerItem
        label="Terms of Service"
        icon={({ color, size }) => (
          <Ionicons name="document-text" size={size} color={color} />
        )}
        onPress={() => void Linking.openURL(TERMS_URL)}
      />
      <DrawerItem
        label="Delete account"
        icon={({ color, size }) => (
          <Ionicons name="trash" size={size} color={color} />
        )}
        onPress={requestAccountDeletion}
      />
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
