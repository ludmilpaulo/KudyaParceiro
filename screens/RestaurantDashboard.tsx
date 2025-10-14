// screens/RestaurantDashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { selectUser } from '../redux/slices/authSlice';
import { fetchFornecedorData, updateLocation } from '../services/apiService';
import { FornecedorType } from '../services/types';
import tailwind from 'twrnc'; // Correct import for tailwind
import Screen from '../components/Screen';
import { LinearGradient } from 'expo-linear-gradient';
import { HelpCircle } from 'react-native-feather';
import HelpGuideModal from '../components/HelpGuideModal';

const RestaurantDashboard: React.FC = () => {
  const user = useSelector(selectUser);
  const [fornecedor, setFornecedor] = useState<FornecedorType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const helpSections = [
    {
      title: 'Como usar o Dashboard',
      content: 'O dashboard do restaurante permite gerenciar pedidos, produtos e perfil.',
      steps: [
        'Navegue pelo menu lateral para acessar diferentes seções',
        'Visualize pedidos pendentes na página inicial',
        'Atualize o status dos pedidos conforme progridem',
        'Gerencie seus produtos e horários de funcionamento',
      ],
    },
    {
      title: 'Gerenciamento de Pedidos',
      content: 'Acompanhe e gerencie todos os seus pedidos em tempo real.',
      steps: [
        'Aceite ou rejeite novos pedidos',
        'Atualize o status do pedido (preparando, pronto, entregue)',
        'Veja detalhes completos do pedido e informações do cliente',
        'Entre em contato com entregadores quando necessário',
      ],
    },
    {
      title: 'Adicionar Produtos',
      content: 'Adicione e gerencie os produtos do seu restaurante.',
      steps: [
        'Clique em "Produtos" no menu',
        'Adicione fotos, descrições e preços',
        'Defina categorias para seus produtos',
        'Ative ou desative produtos conforme disponibilidade',
      ],
    },
    {
      title: 'Configurar Horários',
      content: 'Defina seus horários de funcionamento.',
      steps: [
        'Acesse "Perfil" no menu',
        'Configure horários para cada dia da semana',
        'Marque dias de fechamento ou feriados',
      ],
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (user?.user_id) {
        try {
          setLoading(true);
          const data = await fetchFornecedorData(user.user_id);
          setFornecedor(data);
        } catch (error) {
          setError('Ocorreu um erro ao buscar os dados');
          console.error('Fetch Fornecedor Data Error:', error); // Debugging statement
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const updateLocationWithRetry = async (userId: number, location: string, retries: number = 3) => {
    try {
      const response = await updateLocation(userId, location);
      console.log('Location update response:', response);
    } catch (error) {
      console.error('Error updating location:', error);
      if (retries > 0) {
        setTimeout(() => {
          updateLocationWithRetry(userId, location, retries - 1);
        }, 1000);
      } else {
        console.error('Failed to update location after multiple attempts');
      }
    }
  };

  useEffect(() => {
    const updateLocationPeriodically = async () => {
      if (user?.user_id) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const loc = `${latitude},${longitude}`;
        console.log('Updating location to:', loc);
        await updateLocationWithRetry(user.user_id, loc);
      }
    };

    const intervalId = setInterval(updateLocationPeriodically, 5000); // Update every 5 seconds for testing
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <LinearGradient colors={['#FCB61A', '#0171CE']} style={styles.container}>
      <Screen>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}
        {error && <Text style={tailwind`text-red-500`}>{error}</Text>}
        {!loading && !error && fornecedor && (
          <View style={tailwind`p-4`}>
            <View style={styles.headerContainer}>
              <Text style={tailwind`text-2xl font-bold text-white`}>Bem-vindo, {fornecedor.name}!</Text>
              <TouchableOpacity onPress={() => setShowHelp(true)} style={styles.helpButton}>
                <HelpCircle width={28} height={28} color="#FFF" />
              </TouchableOpacity>
            </View>
            {/* Add additional content here */}
          </View>
        )}
      </Screen>
      <HelpGuideModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        sections={helpSections}
        title="Guia do Dashboard"
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
});

export default RestaurantDashboard;
