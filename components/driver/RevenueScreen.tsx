import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { baseAPI } from '../../services/types';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Revenue {
  [key: string]: number;
}

const daysOfWeekInPortuguese: { [key in 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun']: string } = {
  Mon: 'Seg',
  Tue: 'Ter',
  Wed: 'Qua',
  Thu: 'Qui',
  Fri: 'Sex',
  Sat: 'Sáb',
  Sun: 'Dom',
};

const RevenueScreen = () => {
  const user = useSelector(selectUser);
  const [revenue, setRevenue] = useState<Revenue>({});
  const [paidOrders, setPaidOrders] = useState<any[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('week');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [showEndPicker, setShowEndPicker] = useState<boolean>(false);

  const fetchRevenue = async () => {
    try {
      const response = await axios.post(`${baseAPI}/report/driver-commission-revenue/`, {
        access_token: user.token,
        filter_type: filterType,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });

      let translatedRevenue = {};
      if (filterType === 'week') {
        translatedRevenue = Object.fromEntries(
          Object.entries(response.data.revenue).map(([day, amount]) => [
            daysOfWeekInPortuguese[day as keyof typeof daysOfWeekInPortuguese] || day,
            amount,
          ])
        );
      } else {
        translatedRevenue = response.data.revenue;
      }

      setRevenue(translatedRevenue);
      setPaidOrders(response.data.paid_orders);
      setUnpaidOrders(response.data.unpaid_orders);
    } catch (error) {
      console.error('Error fetching revenue data', error);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [filterType, startDate, endDate, user.token]);

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  const handleDownloadProof = async (proofUrl: string) => {
    if (proofUrl) {
      const fullUrl = `${baseAPI}${proofUrl}`;
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        console.error('Don\'t know how to open this URL:', fullUrl);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Receitas</Text>
      <Picker
        selectedValue={filterType}
        style={styles.picker}
        onValueChange={(itemValue) => setFilterType(itemValue)}
      >
        <Picker.Item label="Semanal" value="week" />
        <Picker.Item label="Diário" value="day" />
        <Picker.Item label="Mensal" value="month" />
        <Picker.Item label="Personalizado" value="custom" />
      </Picker>
      {filterType === 'custom' && (
        <View style={styles.dateInputContainer}>
          <View>
            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>Data de início: {startDate.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onStartDateChange}
              />
            )}
          </View>
          <View>
            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>Data de término: {endDate.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndDateChange}
              />
            )}
          </View>
          <TouchableOpacity style={styles.fetchButton} onPress={fetchRevenue}>
            <Text style={styles.fetchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      )}
      {Object.entries(revenue).map(([timePeriod, amount]) => (
        <View key={timePeriod} style={styles.revenueItem}>
          <Text style={styles.timePeriod}>{timePeriod}</Text>
          <Text style={styles.amount}>{amount} KZ</Text>
        </View>
      ))}
      <View style={styles.ordersContainer}>
        <Text style={styles.ordersTitle}>Pedidos Pagos</Text>
        {paidOrders.map((order) => (
          <View key={order.order_id} style={styles.orderItem}>
            <Text style={styles.orderText}>Pedido ID: {order.order_id}</Text>
            <Text style={styles.orderText}>Valor Pago: {order.amount} KZ</Text>
            {order.proof_of_payment && (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownloadProof(order.proof_of_payment)}
              >
                <Text style={styles.downloadButtonText}>Baixar Prova de Pagamento</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      <View style={styles.ordersContainer}>
        <Text style={styles.ordersTitle}>Pedidos Não Pagos</Text>
        {unpaidOrders.map((order) => (
          <View key={order.order_id} style={styles.orderItem}>
            <Text style={styles.orderText}>Pedido ID: {order.order_id}</Text>
            <Text style={styles.orderText}>Valor: {order.amount} KZ</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  dateInputContainer: {
    marginBottom: 20,
  },
  datePickerButton: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 4,
  },
  datePickerText: {
    fontSize: 16,
    color: '#495057',
  },
  fetchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  fetchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  revenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  timePeriod: {
    fontSize: 18,
    color: '#495057',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#28a745',
  },
  ordersContainer: {
    marginTop: 20,
  },
  ordersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  orderText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 5,
  },
  downloadButton: {
    marginTop: 10,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default RevenueScreen;
