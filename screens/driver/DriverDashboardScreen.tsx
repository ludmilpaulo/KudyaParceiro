import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import {
  useGetDriverDashboardQuery,
  useUpdateDriverAvailabilityMutation,
} from "../../redux/slices/driverDashboardApi";
import { selectUser } from "../../redux/slices/authSlice";
import { useDriverLocationSync } from "../../hooks/useDriverLocationSync";
import { useDriverCapabilities } from "../../hooks/useDriverCapabilities";
import { spacing } from "../../theme/driverDashboardTokens";
import type { DriverDashboardActiveTrip } from "../../types/driverDashboard";
import DriverHeader from "../../components/driver/dashboard/DriverHeader";
import DriverSummaryCard from "../../components/driver/dashboard/DriverSummaryCard";
import ActiveTripCard from "../../components/driver/dashboard/ActiveTripCard";
import DriverStatsGrid from "../../components/driver/dashboard/DriverStatsGrid";
import QuickActionsSection from "../../components/driver/dashboard/QuickActionsSection";
import VehicleDocumentsCard from "../../components/driver/dashboard/VehicleDocumentsCard";
import AccountStatusCard from "../../components/driver/dashboard/AccountStatusCard";
import DashboardSkeleton from "../../components/driver/dashboard/DashboardSkeleton";
import DashboardErrorState from "../../components/driver/dashboard/DashboardErrorState";
import DriverShellLayout from "../../components/driver/dashboard/DriverShellLayout";

type DriverHomeStackParamList = {
  DriverDashboard: undefined;
  FoodDeliveries: undefined;
  ParcelDeliveries: undefined;
  ActiveTripMap: { trip?: DriverDashboardActiveTrip };
  Account: undefined;
  DriverDocuments: undefined;
  DriverVerification: undefined;
  DriverTasks: undefined;
};

type Nav = NativeStackNavigationProp<DriverHomeStackParamList>;

export default function DriverDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { modes, showFood, showParcel, showTaxi } = useDriverCapabilities();
  const { data, isLoading, isError, refetch, isFetching } = useGetDriverDashboardQuery(undefined, {
    pollingInterval: 30000,
  });
  const [updateAvailability, { isLoading: togglingOnline }] = useUpdateDriverAvailabilityMutation();
  const authUser = useSelector(selectUser) as { token?: string; access_token?: string } | null;
  const token = authUser?.access_token ?? authUser?.token;
  const [refreshing, setRefreshing] = useState(false);

  useDriverLocationSync(Boolean(data?.driver.isOnline), token);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleToggleOnline = async (value: boolean) => {
    if (value && modes.length === 0) {
      Alert.alert("Cannot go online", "Your vehicle has no approved services yet.");
      return;
    }
    try {
      const result = await updateAvailability({ isOnline: value }).unwrap();
      if (!value) return;
      Alert.alert("Online", result.message);
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail;
      Alert.alert("Cannot go online", detail || "Complete verification before going online.");
    }
  };

  const handleTripAction = (trip: DriverDashboardActiveTrip) => {
    if (trip.tripType === "ride") {
      navigation.navigate("DriverTasks");
      return;
    }
    navigation.navigate("ActiveTripMap", { trip });
  };

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <DashboardErrorState onRetry={() => void refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <DriverShellLayout activeTab="Navigate">
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing || isFetching} onRefresh={onRefresh} />}
        >
          <DriverHeader
            driverName={data.driver.name}
            avatarUrl={data.driver.avatarUrl}
            isOnline={data.driver.isOnline}
            unreadCount={data.notifications.unreadCount}
            togglingOnline={togglingOnline}
            onToggleOnline={(v) => void handleToggleOnline(v)}
          />
          <DriverSummaryCard summary={data.summary} rating={data.driver.rating} />
          <ActiveTripCard
            trip={data.activeTrip}
            currency={data.summary.currency}
            onTripAction={handleTripAction}
          />
          <DriverStatsGrid
            summary={data.summary}
            onOrdersPress={showFood ? () => navigation.navigate("FoodDeliveries") : undefined}
          />
          <QuickActionsSection
            showFood={showFood}
            showParcels={showParcel}
            showTaxi={showTaxi}
            onFoodPress={showFood ? () => navigation.navigate("FoodDeliveries") : undefined}
            onParcelsPress={showParcel ? () => navigation.navigate("ParcelDeliveries") : undefined}
            onTaxiPress={showTaxi ? () => navigation.navigate("DriverTasks") : undefined}
            onNavigatePress={() => navigation.navigate("ActiveTripMap", { trip: data.activeTrip ?? undefined })}
            onSupportPress={() => Alert.alert("Support", "Contact Kudya support at support@kudya.shop")}
          />
          <VehicleDocumentsCard
            vehicle={data.vehicle}
            onPress={() => navigation.navigate("DriverDocuments")}
          />
          <AccountStatusCard
            status={data.driver.accountStatus}
            onPress={() => navigation.navigate("DriverVerification")}
          />
        </ScrollView>
      </SafeAreaView>
    </DriverShellLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 110 },
});
