import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "../hooks/useTranslation";
import GroceryDashboardScreen from "../screens/grocery/GroceryDashboardScreen";
import GroceryProductFormScreen from "../screens/grocery/GroceryProductFormScreen";
import { GroceryInventoryScreen, GroceryOrdersScreen, GroceryProductsScreen } from "../screens/grocery/GroceryOpsScreens";
import {
  GroceryAnalyticsScreen,
  GroceryCategoriesScreen,
  GroceryCustomersScreen,
  GroceryDeliveryScreen,
  GroceryHelpScreen,
  GroceryHoursScreen,
  GroceryMoreScreen,
  GroceryNotificationsScreen,
  GroceryOrderDetailScreen,
  GroceryPayoutsScreen,
  GroceryPromotionsScreen,
  GroceryRevenueScreen,
  GroceryReviewsScreen,
  GrocerySalesScreen,
  GrocerySettingsScreen,
  GroceryStaffScreen,
  GroceryStoreScreen,
} from "../screens/grocery/GroceryExtraScreens";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function GroceryTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: "#056B34" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#0B8F45",
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            GroceryHome: "grid-outline",
            GroceryOrders: "receipt-outline",
            GroceryProducts: "cube-outline",
            GroceryInventory: "layers-outline",
            GroceryMore: "ellipsis-horizontal",
          };
          return <Ionicons name={icons[route.name] || "ellipse"} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="GroceryHome" component={GroceryDashboardScreen} options={{ title: t("gpDashboard") }} />
      <Tab.Screen name="GroceryOrders" component={GroceryOrdersScreen} options={{ title: t("gpOrders") }} />
      <Tab.Screen name="GroceryProducts" component={GroceryProductsScreen} options={{ title: t("gpProducts") }} />
      <Tab.Screen name="GroceryInventory" component={GroceryInventoryScreen} options={{ title: t("gpInventory") }} />
      <Tab.Screen name="GroceryMore" component={GroceryMoreScreen} options={{ title: t("gpMore") }} />
    </Tab.Navigator>
  );
}

export default function GroceryNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#056B34" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="GroceryTabs" component={GroceryTabs} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryProductNew" component={GroceryProductFormScreen} options={{ title: t("gpAddProduct") }} />
      <Stack.Screen name="GroceryProductEdit" component={GroceryProductFormScreen} options={{ title: t("gpProducts") }} />
      <Stack.Screen name="GroceryOrderDetail" component={GroceryOrderDetailScreen} options={{ title: t("gpOrders") }} />
      <Stack.Screen name="GrocerySales" component={GrocerySalesScreen} options={{ title: t("gpSales") }} />
      <Stack.Screen name="GroceryRevenue" component={GroceryRevenueScreen} options={{ title: t("gpRevenue") }} />
      <Stack.Screen name="GroceryPayouts" component={GroceryPayoutsScreen} options={{ title: t("gpPayouts") }} />
      <Stack.Screen name="GroceryAnalytics" component={GroceryAnalyticsScreen} options={{ title: t("gpAnalytics") }} />
      <Stack.Screen name="GroceryPromotions" component={GroceryPromotionsScreen} options={{ title: t("gpPromotions") }} />
      <Stack.Screen name="GroceryCategories" component={GroceryCategoriesScreen} options={{ title: t("gpCategories") }} />
      <Stack.Screen name="GroceryCustomers" component={GroceryCustomersScreen} options={{ title: t("gpCustomers") }} />
      <Stack.Screen name="GroceryReviews" component={GroceryReviewsScreen} options={{ title: t("gpReviews") }} />
      <Stack.Screen name="GroceryStore" component={GroceryStoreScreen} options={{ title: t("gpStoreProfile") }} />
      <Stack.Screen name="GroceryHours" component={GroceryHoursScreen} options={{ title: t("gpOpeningHours") }} />
      <Stack.Screen name="GroceryDelivery" component={GroceryDeliveryScreen} options={{ title: t("gpDeliverySettings") }} />
      <Stack.Screen name="GroceryStaff" component={GroceryStaffScreen} options={{ title: t("gpStaff") }} />
      <Stack.Screen name="GrocerySettings" component={GrocerySettingsScreen} options={{ title: t("gpSettings") }} />
      <Stack.Screen name="GroceryHelp" component={GroceryHelpScreen} options={{ title: t("gpHelp") }} />
      <Stack.Screen name="GroceryNotifications" component={GroceryNotificationsScreen} options={{ title: t("gpNotifications") }} />
    </Stack.Navigator>
  );
}
