import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useSelector } from 'react-redux';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import tailwind from 'twrnc';
import { selectUser } from '../../redux/slices/authSlice';
import { baseAPI } from '../../services/types';

interface ReportData {
  revenue: number[];
  orders: number[];
  meals?: { labels: string[]; data: number[] };
  drivers?: { labels: string[]; data: number[] };
  customers?: { labels: string[]; data: number[] };
  proof_of_payment?: string;
  total_paid_amount?: number;
  total_restaurant_amount?: number;
}

const screenWidth = Dimensions.get('window').width;

const Report: React.FC = () => {
  const [data, setData] = useState<ReportData>({
    revenue: [],
    orders: [],
    meals: { labels: [], data: [] },
    drivers: { labels: [], data: [] },
    customers: { labels: [], data: [] },
    proof_of_payment: '',
    total_paid_amount: 0,
    total_restaurant_amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week'); // default to week
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const user = useSelector(selectUser);

  const toNaiveISOString = (date: Date) => {
    return date.toISOString().split('.')[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const naiveStartDate = toNaiveISOString(startDate);
        const naiveEndDate = toNaiveISOString(endDate);
        const url = `${baseAPI}/report/restaurant/${user.user_id}/?timeframe=${timeframe}&start_date=${naiveStartDate}&end_date=${naiveEndDate}`;
        console.log('Fetching data from:', url);

        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.log('Response error text:', errorText);
          throw new Error('Falha ao buscar dados');
        }

        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (responseData.message) {
          // Handle the case where no sales data is available
          setData({
            revenue: [],
            orders: [],
            meals: { labels: [], data: [] },
            drivers: { labels: [], data: [] },
            customers: { labels: [], data: [] },
            proof_of_payment: '',
            total_paid_amount: 0,
            total_restaurant_amount: 0,
          });
        } else {
          setData(responseData);
        }
      } catch (error:any) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, timeframe, startDate, endDate]);

  if (loading) {
    return (
      <View style={tailwind`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: '#1c1c1e',
    backgroundGradientFrom: '#1c1c1e',
    backgroundGradientTo: '#1c1c1e',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForBackgroundLines: {
      strokeWidth: 1,
      strokeDasharray: "2,2",
      stroke: "rgba(255, 255, 255, 0.3)"
    },
    barPercentage: 0.5,
  };

  const renderGraph = () => {
    if (data.revenue.length === 0) {
      return <Text style={tailwind`text-center`}>Nenhum dado de rendimento disponível</Text>;
    }

    switch (timeframe) {
      case 'day':
        return (
          <LineChart
            data={{
              labels: ['0h', '1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'],
              datasets: [{ data: data.revenue }],
            }}
            width={screenWidth - 48}
            height={220}
            yAxisLabel="Kz"
            chartConfig={chartConfig}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        );
      case 'week':
        return (
          <BarChart
            data={{
              labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb','Dom'],
              datasets: [{ data: data.revenue }],
            }}
            width={screenWidth - 48}
            height={220}
            yAxisLabel="Kz"
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        );
      case 'month':
        const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
        const monthLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
        const monthData = new Array(daysInMonth).fill(0);
        data.revenue.forEach((value, index) => {
          if (index < daysInMonth) {
            monthData[index] = value;
          }
        });
        return (
          <BarChart
            data={{
              labels: monthLabels,
              datasets: [{ data: monthData }],
            }}
            width={screenWidth - 48}
            height={220}
            yAxisLabel="Kz"
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        );
      case 'custom':
        const customDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const customLabels = Array.from({ length: customDays }, (_, i) => new Date(startDate.getTime() + i * (1000 * 60 * 60 * 24)).toLocaleDateString('pt-PT'));
        const customData = new Array(customDays).fill(0);
        data.revenue.forEach((value, index) => {
          if (index < customDays) {
            customData[index] = value;
          }
        });
        return (
          <LineChart
            data={{
              labels: customLabels,
              datasets: [{ data: customData }],
            }}
            width={screenWidth - 48}
            height={220}
            yAxisLabel="Kz"
            chartConfig={chartConfig}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={tailwind`flex-1 bg-white p-4`}>
      <Text style={tailwind`text-3xl font-bold text-center mb-8`}>Relatório da Loja</Text>
      
      <View style={tailwind`flex flex-row justify-around mb-8`}>
        <TouchableOpacity onPress={() => setTimeframe('day')} style={[styles.filterButton, timeframe === 'day' && styles.activeFilter]}>
          <Text style={tailwind`text-white`}>Dia</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTimeframe('week')} style={[styles.filterButton, timeframe === 'week' && styles.activeFilter]}>
          <Text style={tailwind`text-white`}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTimeframe('month')} style={[styles.filterButton, timeframe === 'month' && styles.activeFilter]}>
          <Text style={tailwind`text-white`}>Mês</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTimeframe('custom')} style={[styles.filterButton, timeframe === 'custom' && styles.activeFilter]}>
          <Text style={tailwind`text-white`}>Personalizado</Text>
        </TouchableOpacity>
      </View>

      {timeframe === 'custom' && (
        <View style={tailwind`flex flex-row justify-around mb-8`}>
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.datePickerButton}>
            <Text style={tailwind`text-black`}>Início: {startDate.toLocaleDateString('pt-PT')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.datePickerButton}>
            <Text style={tailwind`text-black`}>Fim: {endDate.toLocaleDateString('pt-PT')}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) {
                  setStartDate(selectedDate);
                }
              }}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) {
                  setEndDate(selectedDate);
                }
              }}
            />
          )}
        </View>
      )}

      <View style={tailwind`flex flex-col mb-8`}>
        <View style={tailwind`bg-white p-4 rounded-lg shadow-lg mb-8`}>
          <Text style={tailwind`text-xl font-semibold mb-2`}>Rendimento</Text>
          {renderGraph()}
        </View>
        <View style={tailwind`bg-white p-4 rounded-lg shadow-lg mb-8`}>
          <Text style={tailwind`text-xl font-semibold mb-2`}>Número de Encomendas</Text>
          {data.orders.length === 0 ? (
            <Text style={tailwind`text-center`}>Nenhum dado de encomendas disponível</Text>
          ) : (
            <BarChart
              data={{
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb','Dom'],
                datasets: [{ data: data.orders }],
              }}
              width={screenWidth - 48}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          )}
        </View>
        <View style={tailwind`bg-white p-4 rounded-lg shadow-lg mb-8`}>
          <Text style={tailwind`text-xl font-semibold mb-2`}>3 Principais Refeições</Text>
          {data.meals && data.meals.labels.length > 0 ? (
            <PieChart
              data={data.meals.labels.map((label, index) => ({
                name: label,
                population: data.meals!.data[index],
                color: `rgba(131, 167, 234, ${(index + 1) / data.meals!.labels.length})`,
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
              }))}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text style={tailwind`text-center`}>Nenhum dado de refeições disponível</Text>
          )}
        </View>
        <View style={tailwind`bg-white p-4 rounded-lg shadow-lg mb-8`}>
          <Text style={tailwind`text-xl font-semibold mb-2`}>3 Principais Motoristas</Text>
          {data.drivers && data.drivers.labels.length > 0 ? (
            <PieChart
              data={data.drivers.labels.map((label, index) => ({
                name: label,
                population: data.drivers!.data[index],
                color: `rgba(131, 167, 234, ${(index + 1) / data.drivers!.labels.length})`,
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
              }))}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text style={tailwind`text-center`}>Nenhum dado de motoristas disponível</Text>
          )}
        </View>
        <View style={tailwind`bg-white p-4 rounded-lg shadow-lg mb-8`}>
          <Text style={tailwind`text-xl font-semibold mb-2`}>3 Principais Clientes</Text>
          {data.customers && data.customers.labels.length > 0 ? (
            <PieChart
              data={data.customers.labels.map((label, index) => ({
                name: label,
                population: data.customers!.data[index],
                color: `rgba(131, 167, 234, ${(index + 1) / data.customers!.labels.length})`,
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
              }))}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text style={tailwind`text-center`}>Nenhum dado de clientes disponível</Text>
          )}
        </View>
        <View style={tailwind`bg-white p-4 rounded-lg shadow-lg mt-8`}>
          <Text style={tailwind`text-xl font-semibold mb-2`}>Valor Total do Restaurante</Text>
          <Text style={tailwind`text-lg`}>Total a Receber: {data.total_restaurant_amount?.toFixed(2)} Kz</Text>
          {data.total_paid_amount ? (
            <View>
              <Text style={tailwind`text-lg`}>Total Pago: {data.total_paid_amount?.toFixed(2)} Kz</Text>
              {data.proof_of_payment && (
                <TouchableOpacity onPress={() => Linking.openURL(`${baseAPI}${data.proof_of_payment}`)} style={styles.downloadButton}>
                  <Text style={tailwind`text-white`}>Baixar Comprovante de Pagamento</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={tailwind`text-center`}>Nenhum dado de pagamento disponível</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeFilter: {
    backgroundColor: '#1e3a8a',
  },
  datePickerButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  downloadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
});

export default Report;
