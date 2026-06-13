import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  useBlockDoctorSlotMutation,
  useCreateDoctorAvailabilityMutation,
  useDeleteDoctorAvailabilityMutation,
  useGetDoctorAvailabilityQuery,
  useGetDoctorSlotsQuery,
  usePreviewDoctorAvailabilityMutation,
} from "../../redux/slices/doctorApi";
import { useDoctorTranslation } from "../../hooks/useDoctorTranslation";
import type { DoctorStackParamList } from "../../navigation/doctorTypes";

const DAYS = [
  { value: 0, label: "Mon" },
  { value: 1, label: "Tue" },
  { value: 2, label: "Wed" },
  { value: 3, label: "Thu" },
  { value: 4, label: "Fri" },
  { value: 5, label: "Sat" },
  { value: 6, label: "Sun" },
];

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DoctorAvailabilityScreen() {
  const { dt } = useDoctorTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<DoctorStackParamList>>();
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  const [selectedDateObj, setSelectedDateObj] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === "ios");

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDateObj(date);
      setSelectedDate(formatLocalDate(date));
    }
  };

  const { data: availability = [], isLoading } = useGetDoctorAvailabilityQuery();
  const { data: slots = [], isLoading: slotsLoading, refetch: refetchSlots } = useGetDoctorSlotsQuery(selectedDate);
  const [previewAvailability, { data: previewSlots = [], isLoading: previewLoading }] = usePreviewDoctorAvailabilityMutation();
  const [createAvailability, { isLoading: saving }] = useCreateDoctorAvailabilityMutation();
  const [deleteAvailability] = useDeleteDoctorAvailabilityMutation();
  const [blockSlot] = useBlockDoctorSlotMutation();

  const dayLabel = useMemo(() => DAYS.find((d) => d.value === dayOfWeek)?.label ?? "Day", [dayOfWeek]);

  const payload = useMemo(
    () => ({
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      consultation_duration_minutes: 60,
      break_duration_minutes: 10,
      consultation_type: "both",
    }),
    [dayOfWeek, startTime, endTime],
  );

  const handlePreview = async () => {
    try {
      const result = await previewAvailability(payload).unwrap();
      navigation.navigate("DoctorSlotPreview", { dayLabel, slots: result });
    } catch {
      Alert.alert(dt("error"), dt("availabilityFailed"));
    }
  };

  const handleSave = async () => {
    try {
      await createAvailability(payload).unwrap();
      Alert.alert(dt("success"), dt("availabilitySaved"));
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail;
      Alert.alert(dt("error"), detail || dt("availabilityFailed"));
    }
  };

  const toggleBlock = async (id: number, isBlocked: boolean) => {
    await blockSlot({ id, isBlocked: !isBlocked });
    await refetchSlots();
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{dt("setAvailability")}</Text>
      <Text style={styles.rules}>{dt("slotRules")}</Text>

      <View style={styles.dayRow}>
        {DAYS.map((day) => (
          <Pressable
            key={day.value}
            style={[styles.dayChip, dayOfWeek === day.value && styles.dayChipActive]}
            onPress={() => setDayOfWeek(day.value)}
          >
            <Text style={[styles.dayText, dayOfWeek === day.value && styles.dayTextActive]}>{day.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>Start: {startTime}</Text>
        <View style={styles.timeControls}>
          {["09:00", "10:00", "14:00"].map((time) => (
            <Pressable key={time} onPress={() => setStartTime(time)}><Text>{time}</Text></Pressable>
          ))}
        </View>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>End: {endTime}</Text>
        <View style={styles.timeControls}>
          {["13:00", "17:00", "18:00"].map((time) => (
            <Pressable key={time} onPress={() => setEndTime(time)}><Text>{time}</Text></Pressable>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryBtn} disabled={previewLoading} onPress={handlePreview}>
          <Text style={styles.secondaryBtnText}>{dt("previewSlots")}</Text>
        </Pressable>
        <Pressable style={styles.primaryBtn} disabled={saving} onPress={handleSave}>
          <Text style={styles.primaryBtnText}>{dt("saveAvailability")}</Text>
        </Pressable>
      </View>

      {previewSlots.length > 0 && (
        <View>
          <Text style={styles.section}>{dt("slotPreviewTitle")} · {dayLabel}</Text>
          {previewSlots.map((slot, index) => (
            <View key={`${slot.startTime}-${index}`} style={styles.slotCard}>
              <Text style={styles.slotText}>{slot.startTime} – {slot.endTime}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.section}>{dt("calendarSlots")}</Text>
      <Text style={styles.hint}>{dt("blockSlotsHint")}</Text>

      <Pressable
        style={styles.datePickerBtn}
        onPress={() => setShowDatePicker(true)}
        accessibilityRole="button"
      >
        <Text style={styles.datePickerLabel}>{dt("selectDate")}</Text>
        <Text style={styles.dateLabel}>{selectedDate}</Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDateObj}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={onDateChange}
        />
      )}

      {slotsLoading ? (
        <Text style={styles.muted}>{dt("loading")}</Text>
      ) : slots.length === 0 ? (
        <Text style={styles.muted}>{dt("noSlotsYet")}</Text>
      ) : (
        slots.map((slot) => (
          <View key={slot.id} style={styles.savedRow}>
            <View>
              <Text style={styles.savedText}>{slot.startTime}–{slot.endTime}</Text>
              <Text style={styles.muted}>
                {slot.isBooked ? dt("slotBooked") : slot.isBlocked ? dt("slotBlocked") : dt("slotAvailable")}
              </Text>
            </View>
            {!slot.isBooked && (
              <Pressable onPress={() => toggleBlock(slot.id, slot.isBlocked)}>
                <Text style={styles.link}>{slot.isBlocked ? dt("unblockSlot") : dt("blockSlot")}</Text>
              </Pressable>
            )}
          </View>
        ))
      )}

      <Text style={styles.section}>{dt("savedRules")}</Text>
      {availability.length === 0 ? (
        <Text style={styles.muted}>{dt("noAvailabilityConfigured")}</Text>
      ) : (
        availability.map((row) => (
          <View key={row.id} style={styles.savedRow}>
            <Text style={styles.savedText}>{row.dayName} · {row.startTime}–{row.endTime}</Text>
            <Pressable onPress={() => deleteAvailability(row.id)}>
              <Text style={styles.delete}>{dt("removeLabel")}</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  rules: { color: "#64748b", lineHeight: 20 },
  dayRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#cbd5e1" },
  dayChipActive: { backgroundColor: "#0f766e", borderColor: "#0f766e" },
  dayText: { color: "#475569" },
  dayTextActive: { color: "#fff", fontWeight: "700" },
  timeRow: { backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  timeLabel: { fontWeight: "600", color: "#0f172a" },
  timeControls: { flexDirection: "row", gap: 16, marginTop: 8 },
  actions: { flexDirection: "row", gap: 10 },
  primaryBtn: { flex: 1, backgroundColor: "#0f766e", borderRadius: 12, padding: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: "#0f766e", borderRadius: 12, padding: 14, alignItems: "center" },
  secondaryBtnText: { color: "#0f766e", fontWeight: "700" },
  section: { fontWeight: "700", color: "#0f172a", marginTop: 8 },
  hint: { color: "#64748b", fontSize: 13 },
  datePickerBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  datePickerLabel: { fontSize: 12, fontWeight: "600", color: "#64748b", textTransform: "uppercase" },
  dateLabel: { color: "#0f766e", fontWeight: "600", fontSize: 16 },
  muted: { color: "#64748b" },
  slotCard: { backgroundColor: "#ecfeff", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#99f6e4", marginBottom: 6 },
  slotText: { color: "#0f766e", fontWeight: "600" },
  savedRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 6 },
  savedText: { color: "#0f172a", fontWeight: "600" },
  link: { color: "#0f766e", fontWeight: "700" },
  delete: { color: "#dc2626", fontWeight: "600" },
});
