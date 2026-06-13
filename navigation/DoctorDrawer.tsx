import React, { useEffect } from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList, type DrawerContentComponentProps } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";
import { logoutUser } from "../redux/slices/authSlice";
import { useDoctorTranslation } from "../hooks/useDoctorTranslation";
import DoctorDashboardScreen from "../screens/doctor/DoctorDashboardScreen";
import DoctorVerificationScreen from "../screens/doctor/DoctorVerificationScreen";
import DoctorDocumentsScreen from "../screens/doctor/DoctorDocumentsScreen";
import DoctorServicesScreen from "../screens/doctor/DoctorServicesScreen";
import DoctorAvailabilityScreen from "../screens/doctor/DoctorAvailabilityScreen";
import DoctorAppointmentsScreen from "../screens/doctor/DoctorAppointmentsScreen";
import DoctorNotificationsScreen from "../screens/doctor/DoctorNotificationsScreen";
import DoctorPatientsScreen from "../screens/doctor/DoctorPatientsScreen";
import DoctorReviewsScreen from "../screens/doctor/DoctorReviewsScreen";
import DoctorProfileScreen from "../screens/doctor/DoctorProfileScreen";
import DoctorBusinessProfileScreen from "../screens/doctor/DoctorBusinessProfileScreen";
import DoctorAppointmentDetailsScreen from "../screens/doctor/DoctorAppointmentDetailsScreen";
import DoctorSlotPreviewScreen from "../screens/doctor/DoctorSlotPreviewScreen";
import LanguageSettingsScreen from "../screens/doctor/LanguageSettingsScreen";
import DoctorNotificationBell from "../components/doctor/DoctorNotificationBell";
import { registerPartnerPushToken } from "../utils/registerPartnerPush";
import { useGetDoctorVerificationStatusQuery } from "../redux/slices/doctorApi";
import type { DoctorStackParamList } from "./doctorTypes";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator<DoctorStackParamList>();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const dispatch = useDispatch();
  const { dt } = useDoctorTranslation();

  return (
    <LinearGradient colors={["#0f766e", "#14b8a6"]} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerBrand}>Kudya Healthcare</Text>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label={dt("languageSettings")}
          icon={() => <Ionicons name="language-outline" size={22} color="#FFF" />}
          labelStyle={styles.drawerLabel}
          onPress={() => props.navigation.navigate("LanguageSettings")}
        />
        <DrawerItem
          label={dt("logout")}
          icon={() => <Ionicons name="log-out-outline" size={22} color="#FFF" />}
          labelStyle={styles.drawerLabel}
          onPress={() => dispatch(logoutUser())}
        />
      </DrawerContentScrollView>
    </LinearGradient>
  );
}

function DoctorDrawerNav() {
  const { dt } = useDoctorTranslation();
  const { data: verification } = useGetDoctorVerificationStatusQuery(undefined, {
    pollingInterval: 60000,
  });
  const canOperate = Boolean(verification?.canOperate);

  useEffect(() => {
    void registerPartnerPushToken();
  }, []);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0f766e" },
        headerTintColor: "#fff",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#ecfeff",
      }}
    >
      {!canOperate ? (
        <Drawer.Screen
          name="DoctorVerification"
          component={DoctorVerificationScreen}
          options={{
            title: dt("verificationRequired"),
            drawerIcon: () => <Ionicons name="shield-checkmark-outline" size={22} color="#FFF" />,
          }}
        />
      ) : (
        <>
          <Drawer.Screen
            name="DoctorDashboard"
            component={DoctorDashboardScreen}
            options={({ navigation }) => ({
              title: dt("doctorDashboardTitle"),
              drawerIcon: () => <Ionicons name="medkit-outline" size={22} color="#FFF" />,
              headerRight: () => (
                <DoctorNotificationBell onNewBooking={() => navigation.navigate("DoctorAppointments")} />
              ),
            })}
          />
          <Drawer.Screen
            name="DoctorProfile"
            component={DoctorProfileScreen}
            options={{
              title: dt("profile"),
              drawerIcon: () => <Ionicons name="person-outline" size={22} color="#FFF" />,
            }}
          />
          <Drawer.Screen
            name="DoctorAppointments"
            component={DoctorAppointmentsScreen}
            options={{
              title: dt("appointments"),
              drawerIcon: () => <Ionicons name="calendar-outline" size={22} color="#FFF" />,
            }}
          />
          <Drawer.Screen
            name="DoctorAvailability"
            component={DoctorAvailabilityScreen}
            options={{
              title: dt("setAvailability"),
              drawerIcon: () => <Ionicons name="time-outline" size={22} color="#FFF" />,
            }}
          />
          <Drawer.Screen
            name="DoctorServices"
            component={DoctorServicesScreen}
            options={{
              title: dt("services"),
              drawerIcon: () => <Ionicons name="list-outline" size={22} color="#FFF" />,
            }}
          />
          <Drawer.Screen
            name="DoctorPatients"
            component={DoctorPatientsScreen}
            options={{
              title: dt("patients"),
              drawerIcon: () => <Ionicons name="people-outline" size={22} color="#FFF" />,
            }}
          />
          <Drawer.Screen
            name="DoctorReviews"
            component={DoctorReviewsScreen}
            options={{
              title: dt("reviews"),
              drawerIcon: () => <Ionicons name="star-outline" size={22} color="#FFF" />,
            }}
          />
          <Drawer.Screen
            name="DoctorBusinessProfile"
            component={DoctorBusinessProfileScreen}
            options={{
              title: dt("businessProfile"),
              drawerIcon: () => <Ionicons name="business-outline" size={22} color="#FFF" />,
            }}
          />
        </>
      )}
      <Drawer.Screen
        name="DoctorDocuments"
        component={DoctorDocumentsScreen}
        options={{
          title: dt("uploadDocuments"),
          drawerIcon: () => <Ionicons name="document-text-outline" size={22} color="#FFF" />,
        }}
      />
      <Drawer.Screen
        name="DoctorNotifications"
        component={DoctorNotificationsScreen}
        options={{
          title: dt("notifications"),
          drawerIcon: () => <Ionicons name="notifications-outline" size={22} color="#FFF" />,
        }}
      />
      <Drawer.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{
          title: dt("languageSettings"),
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer.Navigator>
  );
}

export default function DoctorDrawer() {
  const { dt } = useDoctorTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DoctorDrawerRoot"
        component={DoctorDrawerNav}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorAppointmentDetails"
        component={DoctorAppointmentDetailsScreen}
        options={{ title: dt("appointmentDetails"), headerStyle: { backgroundColor: "#0f766e" }, headerTintColor: "#fff" }}
      />
      <Stack.Screen
        name="DoctorSlotPreview"
        component={DoctorSlotPreviewScreen}
        options={{ title: dt("slotPreviewTitle"), headerStyle: { backgroundColor: "#0f766e" }, headerTintColor: "#fff" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: { flex: 1 },
  drawerHeader: { paddingTop: Platform.OS === "ios" ? 54 : 24, paddingHorizontal: 20, paddingBottom: 16 },
  drawerBrand: { color: "#fff", fontSize: 20, fontWeight: "700" },
  drawerLabel: { color: "#fff", fontWeight: "600" },
});
