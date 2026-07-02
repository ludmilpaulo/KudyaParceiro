import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useGetDriverVehicleQuery,
  useUpdateDriverVehicleMutation,
} from "../../redux/slices/driverApi";
import { useDriverTranslation } from "../../hooks/useDriverTranslation";

export default function DriverVehicleScreen() {
  const { dt } = useDriverTranslation();
  const { data: vehicle, isLoading } = useGetDriverVehicleQuery();
  const [updateVehicle, { isLoading: saving }] = useUpdateDriverVehicleMutation();
  const [plateNumber, setPlateNumber] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [vehicleType, setVehicleType] = useState("car");

  useEffect(() => {
    if (vehicle) {
      setPlateNumber(vehicle.plateNumber ?? "");
      setMake(vehicle.make ?? "");
      setModel(vehicle.model ?? "");
      setColor(vehicle.color ?? "");
      setVehicleType(vehicle.vehicleType ?? "car");
    }
  }, [vehicle]);

  const onSave = async () => {
    try {
      await updateVehicle({
        plateNumber,
        make,
        model,
        color,
        vehicleType,
      }).unwrap();
      Alert.alert(dt("success"));
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail;
      Alert.alert(dt("error"), detail || dt("error"));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0171CE" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Plate number</Text>
      <TextInput style={styles.input} value={plateNumber} onChangeText={setPlateNumber} />
      <Text style={styles.label}>Make</Text>
      <TextInput style={styles.input} value={make} onChangeText={setMake} />
      <Text style={styles.label}>Model</Text>
      <TextInput style={styles.input} value={model} onChangeText={setModel} />
      <Text style={styles.label}>Color</Text>
      <TextInput style={styles.input} value={color} onChangeText={setColor} />
      <Text style={styles.label}>Vehicle type</Text>
      <TextInput style={styles.input} value={vehicleType} onChangeText={setVehicleType} />
      <Pressable style={[styles.button, saving && styles.disabled]} disabled={saving} onPress={onSave}>
        <Text style={styles.buttonText}>{dt("addVehicleInformation")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  label: { fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#0171CE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.6 },
});
