import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { BarChart, PieChart } from 'react-native-chart-kit';
import tailwind from 'twrnc';
import { selectUser } from '../redux/slices/authSlice';
import { baseAPI } from '../services/types';

interface ReportData {
  revenue: number[];
  orders: number[];
  products?: { labels: string[]; data: number[] };
  drivers?: { labels: string[]; data: number[] };
  customers?: { labels: string[]; data: number[] };
}

const screenWidth = Dimensions.get('window').width;

const Report: React.FC = () => {
  const [data, setData] = useState<ReportData>({
    revenue: [],
    orders: [],
    products: { labels: [], data: [] },
    drivers: { labels: [], data: [] },
    customers: { labels: [], data: [] },
  });
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseAPI}/report/restaurant/${user.user_id}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const responseData: ReportData = await response.json();
        setData(responseData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <View style={tailwind`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tailwind`container mx-auto px-4 py-8`}>
      <Text style={tailwind`text-3xl font-bold mb-4`}>Relatório da loja</Text>
      <View style={tailwind`grid grid-cols-2 gap-4`}>
        <View style={tailwind`border border-gray-300 rounded-lg overflow-hidden`}>
          <View style={tailwind`bg-indigo-200 py-2 px-4`}>
            <Text style={tailwind`text-black font-bold text-lg`}>Rendimento</Text>
          </View>
          <View style={tailwind`p-4`}>
            <BarChart
              data={{
                labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                datasets: [{ data: data.revenue }],
              }}
              width={screenWidth - 32}
              height={220}
              yAxisLabel="Kz"
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              style={tailwind`border-radius: 16`}
            />
          </View>
        </View>

        <View style={tailwind`border border-gray-300 rounded-lg overflow-hidden`}>
          <View style={tailwind`bg-indigo-200 py-2 px-4`}>
            <Text style={tailwind`text-black font-bold text-lg`}>Número de encomendas</Text>
          </View>
          <View style={tailwind`p-4`}>
            <BarChart
              data={{
                labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                datasets: [{ data: data.orders }],
              }}
              width={screenWidth - 32}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              style={tailwind`border-radius: 16`}
            />
          </View>
        </View>

        <View style={tailwind`border border-gray-300 rounded-lg overflow-hidden`}>
          <View style={tailwind`bg-indigo-200 py-2 px-4`}>
            <Text style={tailwind`text-black font-bold text-lg`}>3 principais produtos</Text>
          </View>
          <View style={tailwind`p-4`}>
            {data.products && (
              <PieChart
                data={data.products.labels.map((label, index) => ({
                  name: label,
                  population: data.products!.data[index],
                  color: `rgba(131, 167, 234, ${index / data.products!.labels.length})`,
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 15,
                }))}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: '#e26a00',
                  backgroundGradientFrom: '#fb8c00',
                  backgroundGradientTo: '#ffa726',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            )}
          </View>
        </View>

        <View style={tailwind`border border-gray-300 rounded-lg overflow-hidden`}>
          <View style={tailwind`bg-indigo-200 py-2 px-4`}>
            <Text style={tailwind`text-black font-bold text-lg`}>3 principais motoristas</Text>
          </View>
          <View style={tailwind`p-4`}>
            {data.drivers && (
              <PieChart
                data={data.drivers.labels.map((label, index) => ({
                  name: label,
                  population: data.drivers!.data[index],
                  color: `rgba(131, 167, 234, ${index / data.drivers!.labels.length})`,
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 15,
                }))}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: '#e26a00',
                  backgroundGradientFrom: '#fb8c00',
                  backgroundGradientTo: '#ffa726',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            )}
          </View>
        </View>

        <View style={tailwind`border border-gray-300 rounded-lg overflow-hidden`}>
          <View style={tailwind`bg-indigo-200 py-2 px-4`}>
            <Text style={tailwind`text-black font-bold text-lg`}>3 principais clientes</Text>
          </View>
          <View style={tailwind`p-4`}>
            {data.customers && (
              <PieChart
                data={data.customers.labels.map((label, index) => ({
                  name: label,
                  population: data.customers!.data[index],
                  color: `rgba(131, 167, 234, ${index / data.customers!.labels.length})`,
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 15,
                }))}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: '#e26a00',
                  backgroundGradientFrom: '#fb8c00',
                  backgroundGradientTo: '#ffa726',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Report;
