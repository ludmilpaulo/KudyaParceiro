import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import RestaurantDashboard from '../screens/RestaurantDashboard';
import CustomersList from '../components/restaurant/CustomersList';
import DriverList from '../components/restaurant/DriverList';
import Orders from '../components/restaurant/Order';
import Products from '../components/restaurant/Products';
import Profile from '../components/restaurant/Profile';
import Report from '../components/restaurant/Report';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    props.navigation.navigate('LoginScreenUser');
  };

  return (
    <LinearGradient colors={['#FCB61A', '#0171CE']} style={styles.drawerContent}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label="Logout"
          icon={() => <Ionicons name="log-out-outline" size={22} color="#FFF" />}
          labelStyle={styles.drawerLabelStyle}
          onPress={handleLogout}
        />
      </DrawerContentScrollView>
    </LinearGradient>
  );
};

const RestaurantDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, size }) => {
          let iconName;
          switch (route.name) {
            case 'Restaurant Dashboard':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              return <Ionicons name={iconName} size={size} color="#FFF" />;
            case 'Profile':
              iconName = focused ? 'user' : 'user-o';
              return <FontAwesome name={iconName} size={size} color="#FFF" />;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-long';
              return <MaterialIcons name={iconName} size={size} color="#FFF" />;
            case 'Products':
              iconName = focused ? 'shopping-cart' : 'shopping-cart';
              return <MaterialIcons name={iconName} size={size} color="#FFF" />;
            case 'Report':
              iconName = focused ? 'bar-graph' : 'bar-graph';
              return <Entypo name={iconName} size={size} color="#FFF" />;
            case 'CustomersList':
              iconName = focused ? 'users' : 'users';
              return <Feather name={iconName} size={size} color="#FFF" />;
            case 'DriverList':
              iconName = focused ? 'truck' : 'truck';
              return <FontAwesome name={iconName} size={size} color="#FFF" />;
          }
        },
        drawerActiveTintColor: '#FFF',
        drawerInactiveTintColor: '#FFF',
        drawerLabelStyle: {
          fontSize: 15,
          color: '#FFF',
        },
      })}
    >
      <Drawer.Screen
        name="Restaurant Dashboard"
        component={RestaurantDashboard}
        options={{ drawerLabel: 'Dashboard' }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{ drawerLabel: 'Perfil' }}
      />
      <Drawer.Screen
        name="Orders"
        component={Orders}
        options={{ drawerLabel: 'Pedidos' }}
      />
      <Drawer.Screen
        name="Products"
        component={Products}
        options={{ drawerLabel: 'Produtos' }}
      />
      <Drawer.Screen
        name="Report"
        component={Report}
        options={{ drawerLabel: 'Relatórios' }}
      />
      <Drawer.Screen
        name="CustomersList"
        component={CustomersList}
        options={{ drawerLabel: 'Clientes' }}
      />
      <Drawer.Screen
        name="DriverList"
        component={DriverList}
        options={{ drawerLabel: 'Motoristas' }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerLabelStyle: {
    color: '#FFF',
  },
});

export default RestaurantDrawer;
