import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";
import { usePropertyTranslation } from "../hooks/usePropertyTranslation";
import PropertyDashboardScreen from "../screens/property/PropertyDashboardScreen";
import PropertyListingsScreen from "../screens/property/PropertyListingsScreen";
import PropertyAddWizardScreen from "../screens/property/PropertyAddWizardScreen";
import PropertyEnquiriesScreen from "../screens/property/PropertyEnquiriesScreen";
import PropertyApplicationsScreen from "../screens/property/PropertyApplicationsScreen";
import PropertyApplicationDetailScreen from "../screens/property/PropertyApplicationDetailScreen";
import PropertyStayBookingsScreen from "../screens/property/PropertyStayBookingsScreen";
import PropertyStayCalendarScreen from "../screens/property/PropertyStayCalendarScreen";
import LanguageSettingsScreen from "../screens/doctor/LanguageSettingsScreen";
import Profile from "../components/restaurant/Profile";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const dispatch = useDispatch();
  const { pt } = usePropertyTranslation();

  return (
    <LinearGradient colors={["#0f766e", "#14b8a6"]} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerBrand}>{pt("propertyBrand")}</Text>
        <Text style={styles.drawerSub}>Partner</Text>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label={pt("languageSettings")}
          icon={() => <Ionicons name="language-outline" size={22} color="#FFF" />}
          labelStyle={styles.drawerLabel}
          onPress={() => props.navigation.navigate("LanguageSettings")}
        />
        <DrawerItem
          label={pt("logout")}
          icon={() => <Ionicons name="log-out-outline" size={22} color="#FFF" />}
          labelStyle={styles.drawerLabel}
          onPress={() => dispatch(logoutUser())}
        />
      </DrawerContentScrollView>
    </LinearGradient>
  );
}

export default function PropertyDrawer() {
  const { pt } = usePropertyTranslation();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0f766e" },
        headerTintColor: "#fff",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#ecfeff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Drawer.Screen
        name="PropertyDashboard"
        component={PropertyDashboardScreen}
        options={{
          title: pt("propertyDashboardTitle"),
          drawerLabel: pt("overview"),
          drawerIcon: () => <Ionicons name="home-outline" size={22} color="#FFF" />,
        }}
      />
      <Drawer.Screen
        name="PropertyListings"
        component={PropertyListingsScreen}
        options={{
          title: pt("properties"),
          drawerLabel: pt("properties"),
          drawerIcon: () => <Ionicons name="business-outline" size={22} color="#FFF" />,
        }}
      />
      <Drawer.Screen
        name="PropertyAddWizard"
        component={PropertyAddWizardScreen}
        options={{
          title: pt("addProperty"),
          drawerLabel: pt("addProperty"),
          headerShown: false,
          drawerIcon: () => <Ionicons name="add-circle-outline" size={22} color="#FFF" />,
        }}
      />
      <Drawer.Screen
        name="PropertyEnquiries"
        component={PropertyEnquiriesScreen}
        options={{
          title: pt("enquiries"),
          drawerLabel: pt("enquiries"),
          drawerIcon: () => <Ionicons name="mail-outline" size={22} color="#FFF" />,
        }}
      />
      <Drawer.Screen
        name="PropertyApplications"
        component={PropertyApplicationsScreen}
        options={{
          title: pt("applications"),
          drawerLabel: pt("applications"),
          drawerIcon: () => <Ionicons name="document-text-outline" size={22} color="#FFF" />,
        }}
      />
      <Drawer.Screen
        name="PropertyStayBookings"
        component={PropertyStayBookingsScreen}
        options={{
          title: pt("stayBookings"),
          drawerLabel: pt("stayBookings"),
          drawerIcon: () => <Ionicons name="bed-outline" size={22} color="#FFF" />,
        }}
      />
      <Drawer.Screen
        name="PropertyStayCalendar"
        component={PropertyStayCalendarScreen}
        options={{
          title: pt("availability"),
          drawerLabel: pt("availability"),
          drawerIcon: () => <Ionicons name="calendar-outline" size={22} color="#FFF" />,
        }}
      />
      <Drawer.Screen
        name="PropertyApplicationDetail"
        component={PropertyApplicationDetailScreen}
        options={{
          title: pt("applicationDetails"),
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="PropertyProfile"
        component={Profile}
        options={{
          title: pt("profile"),
          drawerIcon: () => <Ionicons name="person-outline" size={22} color="#FFF" />,
        }}
      />
      <Drawer.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{
          title: pt("languageSettings"),
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: { flex: 1 },
  drawerHeader: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  drawerBrand: { color: "#fff", fontSize: 20, fontWeight: "800" },
  drawerSub: { color: "#ccfbf1", marginTop: 4, fontSize: 12, fontWeight: "600" },
  drawerLabel: { color: "#fff", fontWeight: "600" },
});
