import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
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

function PropertyLanguageSettings() {
  return <LanguageSettingsScreen propertyPreview />;
}

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const dispatch = useDispatch();
  const { pt } = usePropertyTranslation();

  return (
    <View style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerBrand}>{pt("propertyBrand")}</Text>
        <Text style={styles.drawerSub}>{pt("landlordHomeSubtitle")}</Text>
      </View>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        <DrawerItemList {...props} />
        <DrawerItem
          label={pt("languageSettings")}
          icon={() => <Ionicons name="language-outline" size={22} color="#5b21b6" />}
          labelStyle={styles.drawerLabel}
          onPress={() => props.navigation.navigate("LanguageSettings")}
        />
        <DrawerItem
          label={pt("logout")}
          icon={() => <Ionicons name="log-out-outline" size={22} color="#5b21b6" />}
          labelStyle={styles.drawerLabel}
          onPress={() => dispatch(logoutUser())}
        />
      </DrawerContentScrollView>
    </View>
  );
}

export default function PropertyDrawer() {
  const { pt } = usePropertyTranslation();

  return (
    <Drawer.Navigator
      initialRouteName="PropertyDashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#5b21b6" },
        headerTintColor: "#fff",
        drawerActiveTintColor: "#5b21b6",
        drawerInactiveTintColor: "#334155",
        drawerActiveBackgroundColor: "#ede9fe",
        drawerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Drawer.Screen
        name="PropertyAddWizard"
        component={PropertyAddWizardScreen}
        options={{
          title: pt("addProperty"),
          drawerLabel: pt("menuListProperty"),
          headerShown: false,
          drawerIcon: () => <Ionicons name="add-circle-outline" size={22} color="#5b21b6" />,
        }}
      />
      <Drawer.Screen
        name="PropertyStayBookings"
        component={PropertyStayBookingsScreen}
        options={{
          title: pt("stayBookings"),
          drawerLabel: pt("menuBookings"),
          drawerIcon: () => <Ionicons name="bed-outline" size={22} color="#5b21b6" />,
        }}
      />
      <Drawer.Screen
        name="PropertyApplications"
        component={PropertyApplicationsScreen}
        options={{
          title: pt("applications"),
          drawerLabel: pt("menuLeases"),
          drawerIcon: () => <Ionicons name="document-text-outline" size={22} color="#5b21b6" />,
        }}
      />
      <Drawer.Screen
        name="PropertyEnquiries"
        component={PropertyEnquiriesScreen}
        options={{
          title: pt("enquiries"),
          drawerLabel: pt("menuRequests"),
          drawerIcon: () => <Ionicons name="mail-outline" size={22} color="#5b21b6" />,
        }}
      />
      <Drawer.Screen
        name="PropertyStayCalendar"
        component={PropertyStayCalendarScreen}
        options={{
          title: pt("availability"),
          drawerLabel: pt("menuCalendar"),
          drawerIcon: () => <Ionicons name="calendar-outline" size={22} color="#5b21b6" />,
        }}
      />
      <Drawer.Screen
        name="PropertyDashboard"
        component={PropertyDashboardScreen}
        options={{
          title: pt("propertyDashboardTitle"),
          drawerLabel: pt("menuAnalytics"),
          drawerIcon: () => <Ionicons name="stats-chart-outline" size={22} color="#5b21b6" />,
        }}
      />
      <Drawer.Screen
        name="PropertyListings"
        component={PropertyListingsScreen}
        options={{
          title: pt("properties"),
          drawerLabel: pt("pillProperties"),
          drawerIcon: () => <Ionicons name="business-outline" size={22} color="#5b21b6" />,
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
          drawerIcon: () => <Ionicons name="person-outline" size={22} color="#5b21b6" />,
        }}
      />
      <Drawer.Screen
        name="LanguageSettings"
        component={PropertyLanguageSettings}
        options={{
          title: pt("languageSettings"),
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: { flex: 1, backgroundColor: "#fff" },
  drawerHeader: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ede9fe",
  },
  drawerScroll: { paddingTop: 8 },
  drawerBrand: { color: "#5b21b6", fontSize: 20, fontWeight: "800" },
  drawerSub: { color: "#64748b", marginTop: 4, fontSize: 12, fontWeight: "600" },
  drawerLabel: { color: "#1e293b", fontWeight: "600" },
});
