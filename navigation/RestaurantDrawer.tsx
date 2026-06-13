import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { useTranslation } from '../hooks/useTranslation';
import RestaurantDashboard from '../screens/RestaurantDashboard';
import CustomersList from '../components/restaurant/CustomersList';
import DriverList from '../components/restaurant/DriverList';
import Orders from '../components/restaurant/Order';
import Products from '../components/restaurant/Products';
import Profile from '../components/restaurant/Profile';
import Report from '../components/restaurant/Report';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <LinearGradient colors={['#FCB61A', '#0171CE']} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerBrand}>{t('partnerAppName')}</Text>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label={t('logout')}
          icon={() => <Ionicons name="log-out-outline" size={22} color="#FFF" />}
          labelStyle={styles.drawerLabelStyle}
          onPress={handleLogout}
        />
      </DrawerContentScrollView>
    </LinearGradient>
  );
};

const RestaurantDrawer = ({ categorySlug = 'restaurant' }: { categorySlug?: string }) => {
  const { t } = useTranslation();
  const isGrocery = categorySlug === 'grocery';
  const dashboardTitle = isGrocery ? t('drawerGroceryDashboard') : t('drawerDashboard');

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#0171CE' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        drawerIcon: ({ focused, size }) => {
          switch (route.name) {
            case 'Restaurant Dashboard':
              return (
                <Ionicons
                  name={focused ? 'restaurant' : 'restaurant-outline'}
                  size={size}
                  color="#FFF"
                />
              );
            case 'Profile':
              return (
                <FontAwesome name={focused ? 'user' : 'user-o'} size={size} color="#FFF" />
              );
            case 'Orders':
              return (
                <MaterialIcons
                  name={focused ? 'receipt' : 'receipt-long'}
                  size={size}
                  color="#FFF"
                />
              );
            case 'Products':
              return <MaterialIcons name="shopping-cart" size={size} color="#FFF" />;
            case 'Report':
              return <Entypo name="bar-graph" size={size} color="#FFF" />;
            case 'CustomersList':
              return <Feather name="users" size={size} color="#FFF" />;
            case 'DriverList':
              return <FontAwesome name="truck" size={size} color="#FFF" />;
            default:
              return null;
          }
        },
        drawerActiveTintColor: '#FFF',
        drawerInactiveTintColor: 'rgba(255,255,255,0.85)',
        drawerActiveBackgroundColor: 'rgba(255,255,255,0.15)',
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
        },
      })}
    >
      <Drawer.Screen
        name="Restaurant Dashboard"
        component={RestaurantDashboard}
        options={{
          drawerLabel: dashboardTitle,
          title: dashboardTitle,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{ drawerLabel: t('drawerProfile'), title: t('drawerProfile') }}
      />
      <Drawer.Screen
        name="Orders"
        component={Orders}
        options={{ drawerLabel: t('drawerOrders'), title: t('drawerOrders') }}
      />
      <Drawer.Screen
        name="Products"
        component={Products}
        options={{ drawerLabel: t('drawerProducts'), title: t('drawerProducts') }}
      />
      <Drawer.Screen
        name="Report"
        component={Report}
        options={{ drawerLabel: t('drawerReports'), title: t('drawerReports') }}
      />
      <Drawer.Screen
        name="CustomersList"
        component={CustomersList}
        options={{ drawerLabel: t('drawerCustomers'), title: t('drawerCustomers') }}
      />
      <Drawer.Screen
        name="DriverList"
        component={DriverList}
        options={{ drawerLabel: t('drawerDrivers'), title: t('drawerDrivers') }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: { flex: 1 },
  drawerHeader: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  drawerBrand: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  drawerLabelStyle: {
    color: '#FFF',
    fontWeight: '600',
  },
});

export default RestaurantDrawer;
