import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import * as Location from 'expo-location';
import { logoutUser } from '../redux/slices/authSlice';
import tailwind from 'twrnc';
import { FornecedorType } from '../services/types';
import { updateLocation } from '../services/apiService';

import Order from './Order';
import Products from './Products';
import Profile from './Profile';
import CustomersList from './CustomersList';
import Report from './Report';
import DriverList from './DriverList';

interface SidebarProps {
  fornecedor: FornecedorType | null;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ fornecedor, isOpen, onToggle }) => {
  const [showProducts, setShowProducts] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [listOfCustomer, setListOfCustomer] = useState(false);
  const [listOfDriver, setListOfDriver] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    // navigation logic here
  };

  const handleUpdateLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar a localização foi negada');
      return;
    }

    setLoading(true);
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const loc = `${latitude},${longitude}`;

    try {
      await updateLocation(fornecedor?.id || 0, loc);
      alert('Localização atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar a localização:', error);
      alert('Ocorreu um erro ao atualizar a localização.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (showProducts) return <Products />;
    if (showOrders) return <Order />;
    if (showReport) return <Report />;
    if (listOfCustomer) return <CustomersList />;
    if (listOfDriver) return <DriverList />;
    if (showProfile) return <Profile />;
    return null;
  };

  return (
    <View style={tailwind`flex h-full ${isOpen ? 'flex' : 'hidden'}`}>
      <View style={tailwind`fixed inset-0 z-40 md:relative md:z-auto md:flex`}>
        <View style={tailwind`w-64 h-full bg-blue-500 text-white p-4`}>
          <Button onPress={onToggle} title="Close" />
          <View style={tailwind`mb-6 flex items-center`}>
            <Image
              source={{ uri: fornecedor?.logo || 'https://www.kudya.shop/media/logo/azul.png' }}
              style={tailwind`w-12 h-12 rounded-full`}
            />
            <View style={tailwind`ml-4`}>
              <Text style={tailwind`font-semibold`}>{fornecedor?.name}</Text>
              <Text>{fornecedor?.name}</Text>
            </View>
          </View>
          <View style={tailwind`flex-1`}>
            <Text style={tailwind`text-xs font-semibold tracking-wide uppercase`}>Painel</Text>
            <TouchableOpacity style={tailwind`p-2 rounded hover:bg-blue-600`} onPress={() => { setShowProducts(true); setShowOrders(false); setShowReport(false); setListOfCustomer(false); setListOfDriver(false); setShowProfile(false); }}>
              <Text>Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tailwind`p-2 rounded hover:bg-blue-600`} onPress={() => { setShowProducts(false); setShowOrders(true); setShowReport(false); setListOfCustomer(false); setListOfDriver(false); setShowProfile(false); }}>
              <Text>Pedidos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tailwind`p-2 rounded hover:bg-blue-600`} onPress={() => { setShowProducts(false); setShowOrders(false); setShowReport(true); setListOfCustomer(false); setListOfDriver(false); setShowProfile(false); }}>
              <Text>Relatórios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tailwind`p-2 rounded hover:bg-blue-600`} onPress={() => { setShowProducts(false); setShowOrders(false); setShowReport(false); setListOfCustomer(true); setListOfDriver(false); setShowProfile(false); }}>
              <Text>Clientes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tailwind`p-2 rounded hover:bg-blue-600`} onPress={() => { setShowProducts(false); setShowOrders(false); setShowReport(false); setListOfCustomer(false); setListOfDriver(true); setShowProfile(false); }}>
              <Text>Motoristas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tailwind`p-2 rounded hover:bg-blue-600`} onPress={() => { setShowProducts(false); setShowOrders(false); setShowReport(false); setListOfCustomer(false); setListOfDriver(false); setShowProfile(true); }}>
              <Text>Perfil</Text>
            </TouchableOpacity>
          </View>
          <Button title="Atualizar Localização" onPress={handleUpdateLocation} />
          <TouchableOpacity style={tailwind`p-2 mt-4 rounded hover:bg-red-500`} onPress={handleLogout}>
            <Text>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <View style={tailwind`flex-1`}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Sidebar;
