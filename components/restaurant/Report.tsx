import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useSelector } from 'react-redux';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import tailwind from 'twrnc';
import { selectUser } from '../../redux/slices/authSlice';
import { fetchPartnerReport } from '../../features/partner/api/partnerReportsApi';
import AnalyticsDaysFilter from '../analytics/AnalyticsDaysFilter';
import { getBaseApiUrl } from '../../utils/apiClient';

interface ReportData {
  labels?: string[];
  timeframe?: string;
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
  const [loadError, setLoadError] = useState(false);
  const [days, setDays] = useState<7 | 30 | 90>(7);
  const [timeframe, setTimeframe] = useState('week'); // legacy custom mode
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
      setLoadError(false);
      try {
        const naiveStartDate = toNaiveISOString(startDate);
        const naiveEndDate = toNaiveISOString(endDate);
        const useRolling = timeframe === 'week';
        const responseData = await fetchPartnerReport(
          useRolling
            ? { days }
            : {
                timeframe,
                start_date: naiveStartDate,
                end_date: naiveEndDate,
              },
        );
        if ((responseData as { message?: string }).message) {
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
          setData({
            ...responseData,
            meals: responseData.products ?? { labels: [], data: [] },
            total_restaurant_amount: responseData.total_store_amount ?? 0,
          });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error fetching data';
        console.error('Error fetching data:', message);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, timeframe, startDate, endDate, days]);

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

  const axisLabels = (() => {
    if (data.labels && data.labels.length > 0) {
      return data.labels;
    }
    if (timeframe === 'day') {
      return Array.from({ length: 24 }, (_, hour) => `${hour}h`);
    }
    if (timeframe === 'month') {
      return data.orders.map((_, index) => String(index + 1));
    }
    if (timeframe === 'custom') {
      const customDays = Math.max(
        1,
        Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      );
      return Array.from({ length: customDays }, (_, index) =>
        new Date(startDate.getTime() + index * (1000 * 60 * 60 * 24)).toLocaleDateString('pt-PT'),
      );
    }
    return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  })();

  const paymentProofUrl = (path: string) => {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    return `${getBaseApiUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const renderGraph = () => {
    if (data.revenue.length === 0) {
      return <Text style={tailwind`text-center`}>Nenhum dado de rendimento disponível</Text>;
    }

    if (timeframe === 'month' || timeframe === 'custom') {
      return (
        <BarChart
          data={{
            labels: axisLabels,
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
    }

    return (
      <LineChart
        data={{
          labels: axisLabels,
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
  };

  return (
    <ScrollView style={tailwind`flex-1 bg-white p-4`}>
      <Text style={tailwind`text-3xl font-bold text-center mb-8`}>Relatório da Loja</Text>
      {loadError ? (
        <Text style={tailwind`text-center text-red-600 mb-4`}>
          Não foi possível carregar o relatório. Verifique a ligação e tente novamente.
        </Text>
      ) : null}

      {timeframe === 'week' && (
        <AnalyticsDaysFilter
          value={days}
          onChange={setDays}
          labelFor={(value) => (value === 30 ? '30 dias' : value === 90 ? '90 dias' : '7 dias')}
        />
      )}
      
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
                labels: axisLabels,
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
                <TouchableOpacity onPress={() => Linking.openURL(paymentProofUrl(data.proof_of_payment))} style={styles.downloadButton}>
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
